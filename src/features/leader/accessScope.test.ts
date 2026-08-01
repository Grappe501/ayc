import { describe, expect, it } from 'vitest'
import {
  homePathForScope,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
} from './accessScope'

describe('accessScope', () => {
  it('lets master open every team board', () => {
    const scope = { kind: 'master' as const, label: 'Master' }
    expect(scopeCanAccessTeamBoard(scope, 'social-media')).toBe(true)
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

  it('lets segment keys into statewide board, not category boards yet', () => {
    const scope = {
      kind: 'segment' as const,
      segment: 'high-school' as const,
      label: 'HS',
    }
    expect(scopeCanAccessStatewideLeaderBoard(scope)).toBe(true)
    expect(scopeCanAccessTeamBoard(scope, 'organizer')).toBe(false)
    expect(homePathForScope(scope)).toBe('/leader')
  })
})
