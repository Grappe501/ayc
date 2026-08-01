import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  locations,
  people,
  personLeadershipRoles,
  teams,
} from '../db/schema.ts'
import { LEADERSHIP_ROLE_CODES, type LeadershipRoleCode } from '../domain/enums.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'

export type LeadershipRoleRow = {
  id: string
  personId: string
  roleCode: string
  teamId: string | null
  teamSlug: string | null
  teamName: string | null
  locationId: string | null
  locationName: string | null
  locationCode: string | null
  segment: string | null
  isPrimary: boolean
  grantedAt: Date
}

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

function notFound(message: string): Error {
  return Object.assign(new Error('NOT_FOUND'), {
    code: 'NOT_FOUND' as const,
    message,
  })
}

const GRANTABLE: LeadershipRoleCode[] = [
  'LEAD_ORGANIZER',
  'CATEGORY_LEAD',
  'GRAPHIC_DESIGN_LEAD',
  'HS_LEAD_ORGANIZER',
  'WC_LEAD_ORGANIZER',
  'LOCATION_LEAD',
]

export async function listLeadershipRolesForPerson(
  db: AycDatabase,
  personId: string,
): Promise<LeadershipRoleRow[]> {
  const rows = await db
    .select({
      id: personLeadershipRoles.id,
      personId: personLeadershipRoles.personId,
      roleCode: personLeadershipRoles.roleCode,
      teamId: personLeadershipRoles.teamId,
      teamSlug: teams.slug,
      teamName: teams.name,
      locationId: personLeadershipRoles.locationId,
      locationName: locations.name,
      locationCode: locations.code,
      segment: personLeadershipRoles.segment,
      isPrimary: personLeadershipRoles.isPrimary,
      grantedAt: personLeadershipRoles.grantedAt,
    })
    .from(personLeadershipRoles)
    .leftJoin(teams, eq(teams.id, personLeadershipRoles.teamId))
    .leftJoin(locations, eq(locations.id, personLeadershipRoles.locationId))
    .where(
      and(
        eq(personLeadershipRoles.personId, personId),
        isNull(personLeadershipRoles.revokedAt),
      ),
    )

  return rows.map((row) => ({
    id: row.id,
    personId: row.personId,
    roleCode: row.roleCode,
    teamId: row.teamId,
    teamSlug: row.teamSlug ?? null,
    teamName: row.teamName ?? null,
    locationId: row.locationId,
    locationName: row.locationName ?? null,
    locationCode: row.locationCode ?? null,
    segment: row.segment,
    isPrimary: row.isPrimary,
    grantedAt: row.grantedAt,
  }))
}

export type GrantLeadershipRoleInput = {
  personId: string
  roleCode: string
  teamSlug?: string | null
  locationId?: string | null
  segment?: string | null
  isPrimary?: boolean
}

export async function grantLeadershipRole(
  db: AycDatabase,
  input: GrantLeadershipRoleInput,
  actor: ActorContext,
): Promise<LeadershipRoleRow> {
  if (!(LEADERSHIP_ROLE_CODES as readonly string[]).includes(input.roleCode)) {
    throw validationError({ roleCode: 'Unknown leadership role.' })
  }
  if (!GRANTABLE.includes(input.roleCode as LeadershipRoleCode)) {
    throw validationError({ roleCode: 'This role cannot be granted in this slice.' })
  }

  const [person] = await db
    .select()
    .from(people)
    .where(eq(people.id, input.personId))
    .limit(1)
  if (!person) throw notFound('Contact not found.')
  if (person.status === 'ARCHIVED') {
    throw validationError({ status: 'Restore this contact before granting roles.' })
  }

  let teamId: string | null = null
  let segment = input.segment?.trim().toUpperCase() || null

  if (input.roleCode === 'CATEGORY_LEAD' || input.roleCode === 'GRAPHIC_DESIGN_LEAD') {
    const slug =
      input.roleCode === 'GRAPHIC_DESIGN_LEAD'
        ? 'graphic-design'
        : input.teamSlug?.trim()
    if (!slug) throw validationError({ teamSlug: 'Team is required for this role.' })
    const [team] = await db.select().from(teams).where(eq(teams.slug, slug)).limit(1)
    if (!team) throw validationError({ teamSlug: 'Team not found.' })
    teamId = team.id
  }

  if (input.roleCode === 'HS_LEAD_ORGANIZER') segment = 'HIGH_SCHOOL'
  if (input.roleCode === 'WC_LEAD_ORGANIZER') segment = 'WORKING_CLASS'

  let locationId: string | null = null
  if (input.roleCode === 'LOCATION_LEAD') {
    if (!input.locationId) {
      throw validationError({ locationId: 'Location is required for Location Lead.' })
    }
    const [location] = await db
      .select()
      .from(locations)
      .where(and(eq(locations.id, input.locationId), isNull(locations.archivedAt)))
      .limit(1)
    if (!location) throw validationError({ locationId: 'Location not found.' })
    locationId = location.id
  }

  const existing = await db
    .select()
    .from(personLeadershipRoles)
    .where(
      and(
        eq(personLeadershipRoles.personId, input.personId),
        eq(personLeadershipRoles.roleCode, input.roleCode),
        isNull(personLeadershipRoles.revokedAt),
      ),
    )

  const duplicate = existing.find((row) => {
    if (input.roleCode === 'LOCATION_LEAD') return row.locationId === locationId
    if (input.roleCode === 'CATEGORY_LEAD' || input.roleCode === 'GRAPHIC_DESIGN_LEAD') {
      return row.teamId === teamId
    }
    return true
  })
  if (duplicate) {
    throw validationError({ roleCode: 'This role is already active for this person.' })
  }

  const [row] = await db
    .insert(personLeadershipRoles)
    .values({
      personId: input.personId,
      roleCode: input.roleCode,
      teamId,
      locationId,
      segment,
      isPrimary: Boolean(input.isPrimary),
      grantedByActor: actor.actorLabel ?? actor.actorType,
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'ROLE_GRANTED',
    entityType: 'LEADERSHIP_ROLE',
    entityId: row.id,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Granted ${input.roleCode} to ${person.displayName ?? person.firstName}.`,
    metadata: {
      personId: input.personId,
      roleCode: input.roleCode,
      teamId,
      locationId,
      segment,
    },
    requestId: actor.requestId,
  })

  const listed = await listLeadershipRolesForPerson(db, input.personId)
  const created = listed.find((entry) => entry.id === row.id)
  if (!created) throw new Error('Role grant failed to reload.')
  return created
}

export async function revokeLeadershipRole(
  db: AycDatabase,
  roleId: string,
  actor: ActorContext,
): Promise<{ id: string; status: 'revoked' }> {
  const [row] = await db
    .select()
    .from(personLeadershipRoles)
    .where(eq(personLeadershipRoles.id, roleId))
    .limit(1)
  if (!row || row.revokedAt) throw notFound('Leadership role not found.')

  await db
    .update(personLeadershipRoles)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(personLeadershipRoles.id, roleId))

  await insertAuditEvent(db, {
    eventType: 'ROLE_REVOKED',
    entityType: 'LEADERSHIP_ROLE',
    entityId: row.id,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Revoked ${row.roleCode}.`,
    metadata: { personId: row.personId, roleCode: row.roleCode },
    requestId: actor.requestId,
  })

  return { id: row.id, status: 'revoked' }
}
