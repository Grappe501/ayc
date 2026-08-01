/**
 * Idempotent hierarchy seed: ensure teams + Chance LEAD_ORGANIZER role.
 * Boards/roles catalog come from migration 007; this grants Chance after people exist.
 */
import { and, eq, isNull } from 'drizzle-orm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { insertAuditEvent } from '../repos/audit.ts'
import { closeDb, getDb, getDatabaseUrl } from './client.ts'
import { people, personLeadershipRoles } from './schema.ts'
import { seedTeams } from './seed-teams.ts'

export async function seedHierarchy(): Promise<{
  chanceRole: 'inserted' | 'exists' | 'skipped'
}> {
  if (!getDatabaseUrl()) {
    throw new Error('DATABASE_URL is required to seed hierarchy')
  }

  await seedTeams()
  const db = getDb()

  const [chance] = await db
    .select()
    .from(people)
    .where(
      and(
        eq(people.firstName, 'Chance'),
        eq(people.lastName, 'Bradford'),
        isNull(people.archivedAt),
      ),
    )
    .limit(1)

  if (!chance) {
    return { chanceRole: 'skipped' }
  }

  const existing = await db
    .select()
    .from(personLeadershipRoles)
    .where(
      and(
        eq(personLeadershipRoles.personId, chance.id),
        eq(personLeadershipRoles.roleCode, 'LEAD_ORGANIZER'),
        isNull(personLeadershipRoles.revokedAt),
      ),
    )
    .limit(1)

  if (existing[0]) {
    return { chanceRole: 'exists' }
  }

  const [row] = await db
    .insert(personLeadershipRoles)
    .values({
      personId: chance.id,
      roleCode: 'LEAD_ORGANIZER',
      isPrimary: true,
      grantedByActor: 'SYSTEM',
      segment: 'ALL',
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'ROLE_GRANTED',
    entityType: 'LEADERSHIP_ROLE',
    entityId: row.id,
    actorType: 'SYSTEM',
    actorLabel: 'SYSTEM',
    changeSummary: 'Granted LEAD_ORGANIZER to Chance Bradford',
    metadata: { personId: chance.id, roleCode: 'LEAD_ORGANIZER' },
  })

  return { chanceRole: 'inserted' }
}

async function main(): Promise<void> {
  const result = await seedHierarchy()
  console.log('Hierarchy seed complete:', result)
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
