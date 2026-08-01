import { describe, expect, it } from 'vitest'
import {
  canAccessBoard,
  rolesFromUnlockScope,
  scopeCanAccessLocationCategoryBoard,
  scopeCanAccessLocationTeamBoard,
  scopeCanAccessSegmentBoard,
  scopeCanAccessTeamBoard,
  type RoleGrant,
} from './canAccessBoard.ts'

const master: RoleGrant[] = [{ roleCode: 'LEAD_ORGANIZER' }]
const social: RoleGrant[] = [{ roleCode: 'CATEGORY_LEAD', teamSlug: 'social-media' }]
const graphic: RoleGrant[] = [{ roleCode: 'GRAPHIC_DESIGN_LEAD', teamSlug: 'graphic-design' }]
const hs: RoleGrant[] = [{ roleCode: 'HS_LEAD_ORGANIZER', segment: 'HIGH_SCHOOL' }]
const wc: RoleGrant[] = [{ roleCode: 'WC_LEAD_ORGANIZER', segment: 'WORKING_CLASS' }]
const locLead: RoleGrant[] = [{ roleCode: 'LOCATION_LEAD', locationId: 'loc-1' }]

describe('canAccessBoard product law', () => {
  it('lets Lead Organizer open everything', () => {
    expect(canAccessBoard(master, { kind: 'MAIN' })).toBe(true)
    expect(
      canAccessBoard(master, { kind: 'LOCATION_CATEGORY', locationId: 'x', teamSlug: 'events' }),
    ).toBe(true)
  })

  it('lets Social Media open GD secondary; GD lead only GD', () => {
    expect(
      canAccessBoard(social, { kind: 'SECONDARY', teamSlug: 'graphic-design' }),
    ).toBe(true)
    expect(
      canAccessBoard(social, { kind: 'STATEWIDE_CATEGORY', teamSlug: 'social-media' }),
    ).toBe(true)
    expect(
      canAccessBoard(graphic, { kind: 'SECONDARY', teamSlug: 'graphic-design' }),
    ).toBe(true)
    expect(
      canAccessBoard(graphic, { kind: 'STATEWIDE_CATEGORY', teamSlug: 'social-media' }),
    ).toBe(false)
    expect(
      canAccessBoard(graphic, {
        kind: 'LOCATION_TEAM',
        locationId: 'loc-1',
        locationType: 'COLLEGE',
      }),
    ).toBe(false)
  })

  it('scopes HS/WC to segment + matching location TEAM only', () => {
    expect(canAccessBoard(hs, { kind: 'SEGMENT', segment: 'HIGH_SCHOOL' })).toBe(true)
    expect(canAccessBoard(hs, { kind: 'MAIN' })).toBe(true)
    expect(
      canAccessBoard(hs, {
        kind: 'LOCATION_TEAM',
        locationId: 'a',
        locationType: 'HIGH_SCHOOL',
      }),
    ).toBe(true)
    expect(
      canAccessBoard(hs, {
        kind: 'LOCATION_TEAM',
        locationId: 'b',
        locationType: 'COUNTY',
      }),
    ).toBe(false)
    expect(
      canAccessBoard(hs, {
        kind: 'LOCATION_CATEGORY',
        locationId: 'a',
        teamSlug: 'organizer',
      }),
    ).toBe(false)
    expect(
      canAccessBoard(wc, {
        kind: 'LOCATION_TEAM',
        locationId: 'c',
        locationType: 'COUNTY',
      }),
    ).toBe(true)
  })

  it('lets LOCATION_LEAD open only their location TEAM board', () => {
    expect(
      canAccessBoard(locLead, {
        kind: 'LOCATION_TEAM',
        locationId: 'loc-1',
        locationType: 'HIGH_SCHOOL',
      }),
    ).toBe(true)
    expect(
      canAccessBoard(locLead, {
        kind: 'LOCATION_TEAM',
        locationId: 'loc-2',
        locationType: 'HIGH_SCHOOL',
      }),
    ).toBe(false)
    expect(
      canAccessBoard(locLead, {
        kind: 'LOCATION_CATEGORY',
        locationId: 'loc-1',
        teamSlug: 'organizer',
      }),
    ).toBe(false)
  })

  it('bridges unlock scopes to the same law', () => {
    expect(rolesFromUnlockScope({ kind: 'master' })[0]?.roleCode).toBe('LEAD_ORGANIZER')
    expect(scopeCanAccessTeamBoard({ kind: 'category', teamSlug: 'social-media' }, 'graphic-design')).toBe(
      true,
    )
    expect(
      scopeCanAccessTeamBoard({ kind: 'category', teamSlug: 'graphic-design' }, 'social-media'),
    ).toBe(false)
    expect(scopeCanAccessSegmentBoard({ kind: 'segment', segment: 'high-school' }, 'high-school')).toBe(
      true,
    )
    expect(
      scopeCanAccessLocationTeamBoard({ kind: 'segment', segment: 'high-school' }, 'HIGH_SCHOOL'),
    ).toBe(true)
    expect(
      scopeCanAccessLocationCategoryBoard(
        { kind: 'category', teamSlug: 'events' },
        'events',
      ),
    ).toBe(true)
    expect(
      scopeCanAccessLocationCategoryBoard(
        { kind: 'segment', segment: 'high-school' },
        'organizer',
      ),
    ).toBe(false)
  })
})
