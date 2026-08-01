import { describe, expect, it } from 'vitest'
import { AUDIT_EVENT_TYPES, CANONICAL_TEAMS } from './enums.ts'

describe('canonical teams and audit types', () => {
  it('seeds five categories plus Graphic Design with stable slugs and codes', () => {
    expect(CANONICAL_TEAMS).toHaveLength(6)
    expect(CANONICAL_TEAMS.map((t) => t.slug)).toEqual([
      'organizer',
      'voter-registration',
      'social-media',
      'events',
      'outreach',
      'graphic-design',
    ])
    expect(CANONICAL_TEAMS.map((t) => t.code)).toEqual([
      'ORG',
      'VRE',
      'SOC',
      'EVT',
      'OUT',
      'GRD',
    ])
  })

  it('includes required audit event types', () => {
    expect(AUDIT_EVENT_TYPES).toContain('PERSON_CREATED')
    expect(AUDIT_EVENT_TYPES).toContain('BETA_FEEDBACK_SUBMITTED')
    expect(AUDIT_EVENT_TYPES).toContain('LOCATION_CODE_CHANGED')
    expect(AUDIT_EVENT_TYPES).toContain('APPLICATION_SUBMITTED')
    expect(AUDIT_EVENT_TYPES).toContain('APPLICATION_ACCEPTED')
  })
})
