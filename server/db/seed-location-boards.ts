/**
 * Backfill LOCATION_TEAM + LOCATION_CATEGORY boards for every active location.
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { closeDb, getDb, getDatabaseUrl } from './client.ts'
import { ensureLocationBoardsForAll } from '../services/ensureLocationBoards.ts'

export async function seedLocationBoards(): Promise<{
  locations: number
  boardsCreated: number
}> {
  if (!getDatabaseUrl()) {
    throw new Error('DATABASE_URL is required to seed location boards')
  }
  return ensureLocationBoardsForAll(getDb())
}

async function main(): Promise<void> {
  const result = await seedLocationBoards()
  console.log('Location boards seed complete:', result)
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
