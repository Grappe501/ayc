import { describe, expect, it } from 'vitest'
import {
  homePathForScope,
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
    expect(scopeCanAccessStatewideLeaderBoard(scope)).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader/teams/social-media')
  })

  it('sends Graphic Design key to the nested board path', () => {
    const scope = {
      kind: 'category' as const,
      teamSlug: 'graphic-design',
      label: 'Graphic Design',
    }
    expect(scopeCanAccessTeamBoard(scope, 'graphic-design')).toBe(true)
    expect(scopeCanAccessTeamBoard(scope, 'social-media')).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader/teams/social-media/graphic-design')
    expect(teamBoardPath('graphic-design')).toBe('/leader/teams/social-media/graphic-design')
  })

  it('sends segment keys to their segment shells', () => {
    const scope = {
      kind: 'segment' as const,
      segment: 'high-school' as const,
      label: 'HS',
    }
    expect(scopeCanAccessStatewideLeaderBoard(scope)).toBe(true)
    expect(scopeCanAccessSegmentBoard(scope, 'high-school')).toBe(true)
    expect(scopeCanAccessSegmentBoard(scope, 'working-class')).toBe(false)
    expect(scopeCanAccessTeamBoard(scope, 'organizer')).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader/segments/high-school')
  })
})
