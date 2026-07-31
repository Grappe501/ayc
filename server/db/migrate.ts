import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeDb, createSql, getDatabaseUrl } from './client.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

export async function applyMigrations(connectionString = getDatabaseUrl()): Promise<string[]> {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations')
  }

  const sql = createSql(connectionString)
  const applied: string[] = []

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name.endsWith('.sql') && !name.startsWith('000_'))
      .sort()

    for (const file of files) {
      const already = await sql<{ id: string }[]>`
        SELECT id FROM schema_migrations WHERE id = ${file}
      `
      if (already.length > 0) continue

      const body = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
      await sql.begin(async (tx) => {
        await tx.unsafe(body)
        await tx`INSERT INTO schema_migrations (id) VALUES (${file})`
      })
      applied.push(file)
    }

    return applied
  } finally {
    await sql.end({ timeout: 5 })
    await closeDb()
  }
}

async function main(): Promise<void> {
  const applied = await applyMigrations()
  if (applied.length === 0) {
    console.log('No pending migrations.')
    return
  }
  console.log(`Applied migrations:\n- ${applied.join('\n- ')}`)
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false

if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
