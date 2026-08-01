import { describe, expect, it } from 'vitest'
import {
  homePathForScope,
  scopeCanAccessLocationCategoryBoard,
  scopeCanAccessLocationTeamBoard,
  scopeCanAccessSegmentBoard,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
  teamBoardPath,
} from './accessScope'

describe('accessScope', () => {
  it('lets master open every team board and segment shell', () => {
    const scope = { kind: 'master' as const, label: 'Master' }
    expect(scopeCanAccessTeamBoard(scope, 'social-media')).toBe(true)
    expect(scopeCanAccessTeamBoard(scope, 'graphic-design')).toBe(true)
    expect(scopeCanAccessSegmentBoard(scope, 'high-school')).toBe(true)
    expect(scopeCanAccessLocationTeamBoard(scope, 'COLLEGE')).toBe(true)
    expect(scopeCanAccessLocationCategoryBoard(scope, 'events')).toBe(true)
    expect(scopeCanAccessStatewideLeaderBoard(scope)).toBe(true)
    expect(homePathForScope(scope)).toBe('/leader')
  })

  it('limits category keys to their hierarchy', () => {
    const scope = {
      kind: 'category' as const,
      teamSlug: 'social-media',
      label: 'Social Media',
    }
    expect(scopeCanAccessTeamBoard(scope, 'social-media')).toBe(true)
    expect(scopeCanAccessTeamBoard(scope, 'graphic-design')).toBe(true)
    expect(scopeCanAccessTeamBoard(scope, 'events')).toBe(false)
    expect(scopeCanAccessLocationTeamBoard(scope, 'HIGH_SCHOOL')).toBe(true)
    expect(scopeCanAccessLocationCategoryBoard(scope, 'social-media')).toBe(true)
    expect(scopeCanAccessLocationCategoryBoard(scope, 'events')).toBe(false)
    expect(scopeCanAccessStatewideLeaderBoard(scope)).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader/teams/social-media')
  })

  it('keeps Graphic Design off location boards', () => {
    const scope = {
      kind: 'category' as const,
      teamSlug: 'graphic-design',
      label: 'Graphic Design',
    }
    expect(scopeCanAccessLocationTeamBoard(scope, 'COLLEGE')).toBe(false)
    expect(scopeCanAccessLocationCategoryBoard(scope, 'social-media')).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader/teams/social-media/graphic-design')
    expect(teamBoardPath('graphic-design')).toBe('/leader/teams/social-media/graphic-design')
  })

  it('scopes segment keys to matching location TEAM boards only', () => {
    const scope = {
      kind: 'segment' as const,
      segment: 'high-school' as const,
      label: 'HS',
    }
    expect(scopeCanAccessStatewideLeaderBoard(scope)).toBe(true)
    expect(scopeCanAccessSegmentBoard(scope, 'high-school')).toBe(true)
    expect(scopeCanAccessLocationTeamBoard(scope, 'HIGH_SCHOOL')).toBe(true)
    expect(scopeCanAccessLocationTeamBoard(scope, 'COUNTY')).toBe(false)
    expect(scopeCanAccessLocationTeamBoard(scope, 'COLLEGE')).toBe(false)
    expect(scopeCanAccessLocationCategoryBoard(scope, 'organizer')).toBe(false)
    expect(scopeCanAccessTeamBoard(scope, 'organizer')).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader/segments/high-school')
  })
})
