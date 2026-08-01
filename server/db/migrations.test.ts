import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

describe('SQL migrations', () => {
  it('defines Phase 1C canonical tables in 001_init', () => {
    const sql = readFileSync(path.join(migrationsDir, '001_init.sql'), 'utf8')
    for (const table of [
      'people',
      'person_contact_methods',
      'locations',
      'person_location_affiliations',
      'teams',
      'person_team_assignments',
      'beta_feedback',
      'audit_events',
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`)
    }
  })

  it('keeps migration files ordered and skips placeholder from apply list convention', () => {
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
    expect(files[0]).toBe('000_placeholder.sql')
    expect(files).toContain('001_init.sql')
    expect(files).toContain('002_join_form_source.sql')
    expect(files).toContain('003_person_merge.sql')
    expect(files).toContain('004_team_tasks.sql')
  })

  it('defines person_merge_history in 003_person_merge', () => {
    const sql = readFileSync(path.join(migrationsDir, '003_person_merge.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS person_merge_history')
    expect(sql).toContain('PERSON_MERGED')
  })

  it('defines team_tasks in 004_team_tasks', () => {
    const sql = readFileSync(path.join(migrationsDir, '004_team_tasks.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS team_tasks')
    expect(sql).toContain('TEAM_TASK_CREATED')
  })
})
