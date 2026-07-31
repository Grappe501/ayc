import { asc, eq } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { teams } from '../db/schema.ts'

export async function listActiveTeams(db: AycDatabase) {
  return db
    .select()
    .from(teams)
    .where(eq(teams.active, true))
    .orderBy(asc(teams.displayOrder), asc(teams.name))
}

export async function getTeamBySlug(db: AycDatabase, slug: string) {
  const rows = await db.select().from(teams).where(eq(teams.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getTeamById(db: AycDatabase, id: string) {
  const rows = await db.select().from(teams).where(eq(teams.id, id)).limit(1)
  return rows[0] ?? null
}
