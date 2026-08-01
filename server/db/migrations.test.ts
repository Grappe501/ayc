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
    expect(files).toContain('009_membership_applications.sql')
    expect(files).toContain('010_calendars.sql')
    expect(files).toContain('011_calendar_event_rsvps.sql')
    expect(files).toContain('012_calendar_recurrence.sql')
    expect(files).toContain('013_user_accounts.sql')
    expect(files).toContain('014_person_profiles.sql')
    expect(files).toContain('015_location_scoped_tasks_resources.sql')
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

  it('defines membership_applications in 009_membership_applications', () => {
    const sql = readFileSync(
      path.join(migrationsDir, '009_membership_applications.sql'),
      'utf8',
    )
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS membership_applications')
    expect(sql).toContain('APPLICATION_SUBMITTED')
    expect(sql).toContain('MEMBERSHIP_APPLICATION')
  })

  it('defines calendars in 010_calendars', () => {
    const sql = readFileSync(path.join(migrationsDir, '010_calendars.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS calendars')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS calendar_events')
    expect(sql).toContain('CALENDAR_EVENT_CREATED')
    expect(sql).toContain('source_calendar_id')
  })

  it('defines calendar_event_rsvps in 011_calendar_event_rsvps', () => {
    const sql = readFileSync(
      path.join(migrationsDir, '011_calendar_event_rsvps.sql'),
      'utf8',
    )
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS calendar_event_rsvps')
    expect(sql).toContain('CALENDAR_RSVP_INVITED')
    expect(sql).toContain("'YES'")
    expect(sql).toContain('CALENDAR_RSVP')
  })

  it('defines calendar recurrence in 012_calendar_recurrence', () => {
    const sql = readFileSync(
      path.join(migrationsDir, '012_calendar_recurrence.sql'),
      'utf8',
    )
    expect(sql).toContain('recurrence_frequency')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS calendar_event_exceptions')
    expect(sql).toContain('CALENDAR_OCCURRENCE_CANCELLED')
  })

  it('defines user_accounts in 013_user_accounts', () => {
    const sql = readFileSync(path.join(migrationsDir, '013_user_accounts.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS user_accounts')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS account_invites')
    expect(sql).toContain('ACCOUNT_CLAIMED')
    expect(sql).toContain('USER_ACCOUNT')
  })

  it('defines person_profiles in 014_person_profiles', () => {
    const sql = readFileSync(path.join(migrationsDir, '014_person_profiles.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS person_profiles')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS person_profile_notes')
    expect(sql).toContain('PROFILE_UPDATED')
    expect(sql).toContain("'PRIVATE'")
  })

  it('adds location_id to team_tasks and team_resources in 015', () => {
    const sql = readFileSync(
      path.join(migrationsDir, '015_location_scoped_tasks_resources.sql'),
      'utf8',
    )
    expect(sql).toContain('location_id')
    expect(sql).toContain('team_tasks')
    expect(sql).toContain('team_resources')
    expect(sql).toContain('REFERENCES locations')
  })
})




