import { describe, expect, it } from 'vitest'
import { homePathForRoles } from './homePathForRoles.ts'

describe('homePathForRoles', () => {
  it('sends Lead Organizer to the main board', () => {
    expect(homePathForRoles([{ roleCode: 'LEAD_ORGANIZER', segment: 'ALL' }])).toBe('/leader')
  })

  it('prefers segment homes over category', () => {
    expect(
      homePathForRoles([
        { roleCode: 'CATEGORY_LEAD', teamSlug: 'events' },
        { roleCode: 'HS_LEAD_ORGANIZER', segment: 'HIGH_SCHOOL' },
      ]),
    ).toBe('/leader/segments/high-school')
  })

  it('routes category leads to their board', () => {
    expect(homePathForRoles([{ roleCode: 'CATEGORY_LEAD', teamSlug: 'outreach' }])).toBe(
      '/leader/teams/outreach',
    )
  })

  it('falls back to directory with no leadership roles', () => {
    expect(homePathForRoles([])).toBe('/directory')
  })
})
