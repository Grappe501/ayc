import { and, eq, ilike, isNull } from 'drizzle-orm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { deriveDisplayName, normalizeLocationName } from '../domain/normalize.ts'
import { toCompositeCode } from '../domain/locationCodes.ts'
import { closeDb, getDatabaseUrl, getDb } from './client.ts'
import {
  locations,
  people,
  personLocationAffiliations,
  personTeamAssignments,
  teams,
} from './schema.ts'
import { seedTeams } from './seed-teams.ts'
import { LEADERSHIP_ROSTER, type RosterPerson } from './leadershipRoster.ts'
import { insertAuditEvent } from '../repos/audit.ts'

function affiliationFor(type: RosterPerson['locationType']) {
  if (type === 'COLLEGE') return 'CURRENT_COLLEGE'
  if (type === 'HIGH_SCHOOL') return 'CURRENT_SCHOOL'
  return 'COUNTY_RESIDENCE'
}

async function ensureLocation(
  db: ReturnType<typeof getDb>,
  person: RosterPerson,
): Promise<string> {
  const code = person.locationCode.toUpperCase()
  const composite = toCompositeCode(person.locationType, code)
  const existing = await db
    .select()
    .from(locations)
    .where(eq(locations.compositeCode, composite))
    .limit(1)
  if (existing[0]) return existing[0].id

  const [row] = await db
    .insert(locations)
    .values({
      locationType: person.locationType,
      code,
      compositeCode: composite,
      name: person.locationName,
      normalizedName: normalizeLocationName(person.locationName),
      shortName: code,
      state: 'AR',
      active: true,
      createdByActor: 'ROSTER_SEED',
      updatedByActor: 'ROSTER_SEED',
    })
    .returning()
  return row.id
}

async function findExistingPerson(
  db: ReturnType<typeof getDb>,
  person: RosterPerson,
): Promise<string | null> {
  const rows = await db
    .select()
    .from(people)
    .where(
      and(ilike(people.firstName, person.firstName), ilike(people.lastName, person.lastName)),
    )
    .limit(5)
  if (rows.length === 0) return null
  if (person.preferredName) {
    const match = rows.find(
      (r) =>
        (r.preferredName ?? '').toLowerCase() === person.preferredName!.toLowerCase() ||
        r.firstName.toLowerCase() === person.firstName.toLowerCase(),
    )
    return match?.id ?? rows[0].id
  }
  return rows[0].id
}

async function seedPerson(
  db: ReturnType<typeof getDb>,
  person: RosterPerson,
  teamIds: Map<string, string>,
): Promise<'inserted' | 'updated' | 'skipped'> {
  const locationId = await ensureLocation(db, person)
  const existingId = await findExistingPerson(db, person)
  const status = person.status ?? 'ACTIVE'
  const preferredName = person.preferredName ?? null
  const displayName = deriveDisplayName({
    firstName: person.firstName,
    lastName: person.lastName,
    preferredName,
  })

  const primary = person.teams.find((t) => t.primary !== false) ?? person.teams[0]
  const additional = person.teams.filter((t) => t !== primary)

  let personId = existingId
  if (!personId) {
    const [created] = await db
      .insert(people)
      .values({
        firstName: person.firstName,
        lastName: person.lastName,
        preferredName,
        displayName,
        status,
        source: 'BETA_IMPORT',
        preferredContactMethod: 'UNKNOWN',
        createdByActor: 'ROSTER_SEED',
        updatedByActor: 'ROSTER_SEED',
      })
      .returning()
    personId = created.id

    await insertAuditEvent(db, {
      eventType: 'PERSON_CREATED',
      entityType: 'PERSON',
      entityId: personId,
      actorType: 'IMPORT',
      actorLabel: 'ROSTER_SEED',
      changeSummary: `Seeded contact ${displayName}.`,
      metadata: { source: 'leadership_roster' },
    })
  } else {
    await db
      .update(people)
      .set({
        preferredName,
        displayName,
        status,
        updatedAt: new Date(),
        updatedByActor: 'ROSTER_SEED',
      })
      .where(eq(people.id, personId))
  }

  const [affiliation] = await db
    .select()
    .from(personLocationAffiliations)
    .where(
      and(
        eq(personLocationAffiliations.personId, personId),
        eq(personLocationAffiliations.isPrimary, true),
        eq(personLocationAffiliations.status, 'ACTIVE'),
      ),
    )
    .limit(1)

  if (!affiliation) {
    await db.insert(personLocationAffiliations).values({
      personId,
      locationId,
      affiliationType: affiliationFor(person.locationType),
      isPrimary: true,
      status: 'ACTIVE',
    })
  } else if (affiliation.locationId !== locationId) {
    await db
      .update(personLocationAffiliations)
      .set({
        status: 'ENDED',
        isPrimary: false,
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(personLocationAffiliations.id, affiliation.id))
    await db.insert(personLocationAffiliations).values({
      personId,
      locationId,
      affiliationType: affiliationFor(person.locationType),
      isPrimary: true,
      status: 'ACTIVE',
    })
  }

  const activeAssignments = await db
    .select()
    .from(personTeamAssignments)
    .where(
      and(
        eq(personTeamAssignments.personId, personId),
        eq(personTeamAssignments.status, 'ACTIVE'),
      ),
    )

  for (const assignment of activeAssignments) {
    await db
      .update(personTeamAssignments)
      .set({
        status: 'ENDED',
        isPrimary: false,
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(personTeamAssignments.id, assignment.id))
  }

  const primaryTeamId = teamIds.get(primary.slug)
  if (!primaryTeamId) throw new Error(`Missing team ${primary.slug}`)

  await db.insert(personTeamAssignments).values({
    personId,
    teamId: primaryTeamId,
    position: primary.position,
    isPrimary: true,
    status: 'ACTIVE',
    assignedByActor: 'ROSTER_SEED',
  })

  for (const team of additional) {
    const teamId = teamIds.get(team.slug)
    if (!teamId) continue
    await db.insert(personTeamAssignments).values({
      personId,
      teamId,
      position: team.position,
      isPrimary: false,
      status: 'ACTIVE',
      assignedByActor: 'ROSTER_SEED',
    })
  }

  return existingId ? 'updated' : 'inserted'
}

export async function seedLeadershipRoster(): Promise<{
  inserted: number
  updated: number
  total: number
}> {
  if (!getDatabaseUrl()) {
    throw new Error('DATABASE_URL is required to seed the leadership roster')
  }

  await seedTeams()
  const db = getDb()

  const teamRows = await db.select().from(teams).where(isNull(teams.archivedAt))
  const teamIds = new Map(teamRows.map((t) => [t.slug, t.id]))

  let inserted = 0
  let updated = 0

  for (const person of LEADERSHIP_ROSTER) {
    const result = await seedPerson(db, person, teamIds)
    if (result === 'inserted') inserted += 1
    if (result === 'updated') updated += 1
  }

  return { inserted, updated, total: LEADERSHIP_ROSTER.length }
}

async function main(): Promise<void> {
  const result = await seedLeadershipRoster()
  console.log(
    `Leadership roster seed complete: inserted=${result.inserted} updated=${result.updated} total=${result.total}`,
  )
  await closeDb()
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false

if (isDirectRun) {
  main().catch(async (error: unknown) => {
    console.error(error)
    await closeDb()
    process.exitCode = 1
  })
}
