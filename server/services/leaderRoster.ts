import { and, asc, eq, isNull, ne } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  locations,
  people,
  personContactMethods,
  personLocationAffiliations,
  personTeamAssignments,
  teams,
} from '../db/schema.ts'
import { computeContactReachFlags } from '../domain/textReady.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { getTeamById } from '../repos/teams.ts'
import type { TeamPosition } from '../domain/enums.ts'
import { listPipelineTagsForPeople } from './pipelineTagService.ts'

export type LeaderRosterFilters = {
  q?: string
  teamSlug?: string
  locationId?: string
  locationType?: string
  status?: string
  gapsOnly?: boolean
  textReadyOnly?: boolean
  needsPreferredOnly?: boolean
  preferred?: string
  pipelineTag?: string
  limit?: number
}

export type LeaderRosterRow = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  source: string
  preferredContactMethod: string
  textReady: boolean
  needsPreferred: boolean
  pipelineTags: string[]
  createdAt: Date
  updatedAt: Date
  hasEmail: boolean
  hasPhone: boolean
  missingContact: boolean
  location: { id: string; code: string; name: string; locationType: string } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
    position: string
  } | null
  additionalTeams: Array<{ id: string; name: string; slug: string; position: string }>
}

export async function listLeaderRoster(
  db: AycDatabase,
  filters: LeaderRosterFilters = {},
): Promise<{
  total: number
  attention: {
    missingContact: number
    prospective: number
    joinForm: number
    needsPreferred: number
    textReady: number
    readyToLead: number
    needsMentoring: number
    futureLeader: number
    localLeadCandidate: number
    categoryLeadCandidate: number
  }
  people: LeaderRosterRow[]
}> {
  const rows = await db
    .select({
      id: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      displayName: people.displayName,
      status: people.status,
      source: people.source,
      preferredContactMethod: people.preferredContactMethod,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
      locationId: locations.id,
      locationCode: locations.code,
      locationName: locations.name,
      locationType: locations.locationType,
    })
    .from(people)
    .leftJoin(
      personLocationAffiliations,
      and(
        eq(personLocationAffiliations.personId, people.id),
        eq(personLocationAffiliations.isPrimary, true),
        eq(personLocationAffiliations.status, 'ACTIVE'),
      ),
    )
    .leftJoin(locations, eq(locations.id, personLocationAffiliations.locationId))
    .where(
      filters.status && filters.status !== 'ALL'
        ? eq(people.status, filters.status)
        : ne(people.status, 'ARCHIVED'),
    )
    .orderBy(asc(people.lastName), asc(people.firstName))

  const methods = await db
    .select({
      personId: personContactMethods.personId,
      contactType: personContactMethods.contactType,
      consentStatus: personContactMethods.consentStatus,
    })
    .from(personContactMethods)
    .where(isNull(personContactMethods.archivedAt))

  const methodMap = new Map<
    string,
    { email: boolean; phone: boolean; phoneConsent: string | null }
  >()
  for (const method of methods) {
    const current = methodMap.get(method.personId) ?? {
      email: false,
      phone: false,
      phoneConsent: null,
    }
    if (method.contactType === 'EMAIL') current.email = true
    if (method.contactType === 'MOBILE_PHONE') {
      current.phone = true
      current.phoneConsent = method.consentStatus
    }
    methodMap.set(method.personId, current)
  }

  const assignments = await db
    .select({
      personId: personTeamAssignments.personId,
      teamId: teams.id,
      teamName: teams.name,
      teamSlug: teams.slug,
      position: personTeamAssignments.position,
      isPrimary: personTeamAssignments.isPrimary,
    })
    .from(personTeamAssignments)
    .innerJoin(teams, eq(teams.id, personTeamAssignments.teamId))
    .where(eq(personTeamAssignments.status, 'ACTIVE'))

  const assignMap = new Map<
    string,
    {
      primary: LeaderRosterRow['primaryTeam']
      additional: LeaderRosterRow['additionalTeams']
    }
  >()
  for (const row of assignments) {
    const current = assignMap.get(row.personId) ?? { primary: null, additional: [] }
    const team = {
      id: row.teamId,
      name: row.teamName,
      slug: row.teamSlug,
      position: row.position,
    }
    if (row.isPrimary) current.primary = team
    else current.additional.push(team)
    assignMap.set(row.personId, current)
  }

  const tagMap = await listPipelineTagsForPeople(
    db,
    rows.map((row) => row.id),
  )

  let peopleRows: LeaderRosterRow[] = rows.map((row) => {
    const contact = methodMap.get(row.id) ?? {
      email: false,
      phone: false,
      phoneConsent: null,
    }
    const teamsForPerson = assignMap.get(row.id) ?? { primary: null, additional: [] }
    const missingContact = !contact.email && !contact.phone
    const flags = computeContactReachFlags({
      hasEmail: contact.email,
      hasPhone: contact.phone,
      preferredContactMethod: row.preferredContactMethod,
      phoneConsent: contact.phoneConsent,
    })
    return {
      id: row.id,
      displayName:
        row.displayName ??
        `${row.preferredName || row.firstName} ${row.lastName}`.trim(),
      firstName: row.firstName,
      lastName: row.lastName,
      preferredName: row.preferredName,
      status: row.status,
      source: row.source,
      preferredContactMethod: flags.preferredContactMethod,
      textReady: flags.textReady,
      needsPreferred: flags.needsPreferred,
      pipelineTags: tagMap.get(row.id) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasEmail: contact.email,
      hasPhone: contact.phone,
      missingContact,
      location:
        row.locationId && row.locationCode && row.locationName && row.locationType
          ? {
              id: row.locationId,
              code: row.locationCode,
              name: row.locationName,
              locationType: row.locationType,
            }
          : null,
      primaryTeam: teamsForPerson.primary,
      additionalTeams: teamsForPerson.additional,
    }
  })

  if (filters.teamSlug) {
    peopleRows = peopleRows.filter(
      (p) =>
        p.primaryTeam?.slug === filters.teamSlug ||
        p.additionalTeams.some((t) => t.slug === filters.teamSlug),
    )
  }

  if (filters.locationId) {
    peopleRows = peopleRows.filter((p) => p.location?.id === filters.locationId)
  }

  if (filters.locationType) {
    peopleRows = peopleRows.filter((p) => p.location?.locationType === filters.locationType)
  }

  // Attention reflects the board/team scope before list filters (gaps / preferred / search).
  const attention = {
    missingContact: peopleRows.filter((p) => p.missingContact).length,
    prospective: peopleRows.filter((p) => p.status === 'PROSPECTIVE').length,
    joinForm: peopleRows.filter(
      (p) => p.status === 'PROSPECTIVE' && p.source === 'JOIN_FORM',
    ).length,
    needsPreferred: peopleRows.filter((p) => p.needsPreferred).length,
    textReady: peopleRows.filter((p) => p.textReady).length,
    readyToLead: peopleRows.filter((p) => p.pipelineTags.includes('READY_TO_LEAD')).length,
    needsMentoring: peopleRows.filter((p) =>
      p.pipelineTags.includes('NEEDS_MENTORING'),
    ).length,
    futureLeader: peopleRows.filter((p) => p.pipelineTags.includes('FUTURE_LEADER')).length,
    localLeadCandidate: peopleRows.filter((p) =>
      p.pipelineTags.includes('LOCAL_LEAD_CANDIDATE'),
    ).length,
    categoryLeadCandidate: peopleRows.filter((p) =>
      p.pipelineTags.includes('CATEGORY_LEAD_CANDIDATE'),
    ).length,
  }

  if (filters.gapsOnly) {
    peopleRows = peopleRows.filter((p) => p.missingContact || !p.primaryTeam)
  }

  if (filters.textReadyOnly) {
    peopleRows = peopleRows.filter((p) => p.textReady)
  }

  if (filters.needsPreferredOnly) {
    peopleRows = peopleRows.filter((p) => p.needsPreferred)
  }

  if (filters.preferred && filters.preferred !== 'ALL') {
    peopleRows = peopleRows.filter((p) => p.preferredContactMethod === filters.preferred)
  }

  if (filters.pipelineTag && filters.pipelineTag !== 'ALL') {
    peopleRows = peopleRows.filter((p) => p.pipelineTags.includes(filters.pipelineTag!))
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase()
    peopleRows = peopleRows.filter((p) => {
      const hay = [
        p.displayName,
        p.firstName,
        p.lastName,
        p.preferredName,
        p.preferredContactMethod,
        ...p.pipelineTags,
        p.location?.name,
        p.location?.code,
        p.primaryTeam?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  const limit = filters.limit ?? 500
  return {
    total: peopleRows.length,
    attention,
    people: peopleRows.slice(0, limit),
  }
}

export async function assignPersonTeams(
  db: AycDatabase,
  personId: string,
  input: {
    primaryTeamId: string
    position: TeamPosition
    additionalTeamIds?: string[]
  },
  actor: ActorContext,
) {
  const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1)
  if (!person) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Contact not found.',
    })
  }
  if (person.status === 'ARCHIVED') {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Restore this contact before changing teams.' },
    })
  }

  const primaryTeam = await getTeamById(db, input.primaryTeamId)
  if (!primaryTeam?.active) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { primaryTeamId: 'Primary team was not found.' },
    })
  }

  const additional = [...new Set((input.additionalTeamIds ?? []).filter(Boolean))]
  if (additional.includes(input.primaryTeamId)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { additionalTeamIds: 'Additional teams must not repeat the primary team.' },
    })
  }

  for (const teamId of additional) {
    const team = await getTeamById(db, teamId)
    if (!team?.active) {
      throw Object.assign(new Error('VALIDATION_ERROR'), {
        code: 'VALIDATION_ERROR' as const,
        fields: { additionalTeamIds: 'One or more additional teams were not found.' },
      })
    }
  }

  await db.transaction(async (tx) => {
    const active = await tx
      .select()
      .from(personTeamAssignments)
      .where(
        and(
          eq(personTeamAssignments.personId, personId),
          eq(personTeamAssignments.status, 'ACTIVE'),
        ),
      )

    const desired = new Set([input.primaryTeamId, ...additional])

    for (const assignment of active) {
      if (!desired.has(assignment.teamId)) {
        await tx
          .update(personTeamAssignments)
          .set({
            status: 'ENDED',
            isPrimary: false,
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(personTeamAssignments.id, assignment.id))
        await insertAuditEvent(tx, {
          eventType: 'TEAM_ASSIGNMENT_ENDED',
          entityType: 'TEAM_ASSIGNMENT',
          entityId: assignment.id,
          actorType: actor.actorType,
          actorLabel: actor.actorLabel,
          changeSummary: 'Ended team assignment from Leader Board.',
          requestId: actor.requestId,
        })
        continue
      }

      const shouldBePrimary = assignment.teamId === input.primaryTeamId
      if (
        assignment.isPrimary !== shouldBePrimary ||
        assignment.position !== input.position
      ) {
        await tx
          .update(personTeamAssignments)
          .set({
            isPrimary: shouldBePrimary,
            position: input.position,
            updatedAt: new Date(),
          })
          .where(eq(personTeamAssignments.id, assignment.id))
        await insertAuditEvent(tx, {
          eventType: 'TEAM_ASSIGNMENT_UPDATED',
          entityType: 'TEAM_ASSIGNMENT',
          entityId: assignment.id,
          actorType: actor.actorType,
          actorLabel: actor.actorLabel,
          changeSummary: shouldBePrimary
            ? `Updated primary team to ${primaryTeam.name}.`
            : 'Updated team assignment.',
          requestId: actor.requestId,
        })
      }
      desired.delete(assignment.teamId)
    }

    for (const teamId of desired) {
      const [created] = await tx
        .insert(personTeamAssignments)
        .values({
          personId,
          teamId,
          position: input.position,
          isPrimary: teamId === input.primaryTeamId,
          status: 'ACTIVE',
          assignedByActor: actor.actorLabel ?? actor.actorType,
        })
        .returning()
      await insertAuditEvent(tx, {
        eventType: 'TEAM_ASSIGNMENT_CREATED',
        entityType: 'TEAM_ASSIGNMENT',
        entityId: created.id,
        actorType: actor.actorType,
        actorLabel: actor.actorLabel,
        changeSummary:
          teamId === input.primaryTeamId
            ? `Assigned primary team ${primaryTeam.name}.`
            : 'Assigned additional team.',
        requestId: actor.requestId,
      })
    }

    await tx
      .update(people)
      .set({
        updatedAt: new Date(),
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .where(eq(people.id, personId))
  })

  const roster = await listLeaderRoster(db, {})
  return roster.people.find((p) => p.id === personId) ?? null
}
