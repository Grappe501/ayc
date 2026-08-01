import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const url = process.env.DATABASE_URL?.trim() || process.env.NETLIFY_DB_URL?.trim()
if (!url) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = postgres(url, { max: 1, prepare: false })
const body = readFileSync(
  path.join(__dirname, 'migrations', '015_location_scoped_tasks_resources.sql'),
  'utf8',
)

try {
  await sql.begin(async (tx) => {
    await tx.unsafe(body)
    try {
      await tx`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `
      await tx`
        INSERT INTO schema_migrations (id)
        VALUES ('015_location_scoped_tasks_resources.sql')
        ON CONFLICT (id) DO NOTHING
      `
    } catch (err) {
      console.warn('schema_migrations skipped:', err.message)
    }
  })

  const cols = await sql`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('team_tasks', 'team_resources')
      AND column_name = 'location_id'
    ORDER BY table_name
  `
  console.log('015 applied. location_id columns:', cols)
} catch (err) {
  console.error('APPLY_FAILED:', err.message)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
