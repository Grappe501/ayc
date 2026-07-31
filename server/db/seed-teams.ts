import { eq } from 'drizzle-orm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { CANONICAL_TEAMS } from '../domain/enums.ts'
import { closeDb, getDb, getDatabaseUrl } from './client.ts'
import { teams } from './schema.ts'

export async function seedTeams(): Promise<{ inserted: number; updated: number }> {
  if (!getDatabaseUrl()) {
    throw new Error('DATABASE_URL is required to seed teams')
  }

  const db = getDb()
  let inserted = 0
  let updated = 0

  for (const team of CANONICAL_TEAMS) {
    const existing = await db.select().from(teams).where(eq(teams.slug, team.slug)).limit(1)
    if (existing.length === 0) {
      await db.insert(teams).values({
        name: team.name,
        slug: team.slug,
        code: team.code,
        description: team.description,
        active: true,
        displayOrder: team.displayOrder,
      })
      inserted += 1
      continue
    }

    await db
      .update(teams)
      .set({
        name: team.name,
        code: team.code,
        description: team.description,
        active: true,
        displayOrder: team.displayOrder,
        updatedAt: new Date(),
        archivedAt: null,
      })
      .where(eq(teams.slug, team.slug))
    updated += 1
  }

  return { inserted, updated }
}

async function main(): Promise<void> {
  const result = await seedTeams()
  console.log(`Teams seed complete: inserted=${result.inserted} updated=${result.updated}`)
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
