import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'
import * as schema from './schema.ts'

export type AycDatabase = PostgresJsDatabase<typeof schema>

let sqlClient: Sql | null = null
let dbClient: AycDatabase | null = null

/**
 * Database client — Phase 1C. Browser code must never import this module.
 */
export function assertServerOnly(): void {
  if (typeof process === 'undefined' || !process.env) {
    throw new Error('Database access is server-only')
  }
}

export function getDatabaseUrl(): string | undefined {
  assertServerOnly()
  const url = process.env.DATABASE_URL?.trim()
  return url || undefined
}

export function createSql(connectionString = getDatabaseUrl()): Sql {
  assertServerOnly()
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for database access')
  }
  return postgres(connectionString, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  })
}

export function getSql(): Sql {
  if (!sqlClient) {
    sqlClient = createSql()
  }
  return sqlClient
}

export function getDb(): AycDatabase {
  if (!dbClient) {
    dbClient = drizzle(getSql(), { schema })
  }
  return dbClient
}

export async function closeDb(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 })
    sqlClient = null
    dbClient = null
  }
}

export async function pingDatabase(): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql()
    await sql`select 1 as ok`
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Database ping failed',
    }
  }
}
