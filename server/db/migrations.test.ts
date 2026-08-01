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
    expect(files).toContain('005_team_resources.sql')
    expect(files).toContain('006_pipeline_tags.sql')
    expect(files).toContain('007_hierarchy_foundation.sql')
    expect(files).toContain('008_location_boards.sql')
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

  it('defines team_resources in 005_team_resources', () => {
    const sql = readFileSync(path.join(migrationsDir, '005_team_resources.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS team_resources')
    expect(sql).toContain('TEAM_RESOURCE_CREATED')
  })

  it('defines person_pipeline_tags in 006_pipeline_tags', () => {
    const sql = readFileSync(path.join(migrationsDir, '006_pipeline_tags.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS person_pipeline_tags')
    expect(sql).toContain('PIPELINE_TAG_ADDED')
    expect(sql).toContain('PIPELINE_TAG_REMOVED')
  })

  it('defines hierarchy foundation in 007_hierarchy_foundation', () => {
    const sql = readFileSync(path.join(migrationsDir, '007_hierarchy_foundation.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS leadership_roles')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS person_leadership_roles')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS boards')
    expect(sql).toContain('graphic-design')
    expect(sql).toContain('LEAD_ORGANIZER')
    expect(sql).toContain('ROLE_GRANTED')
  })

  it('defines location board indexes in 008_location_boards', () => {
    const sql = readFileSync(path.join(migrationsDir, '008_location_boards.sql'), 'utf8')
    expect(sql).toContain('boards_location_team_uidx')
    expect(sql).toContain('boards_location_category_uidx')
  })
})
