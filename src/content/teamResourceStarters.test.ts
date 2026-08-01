import { describe, expect, it } from 'vitest'
import { TEAMS } from './ayc'
import { TEAM_RESOURCE_STARTERS } from './teamResourceStarters'

describe('team resource starters', () => {
  it('covers every team with at least two starters', () => {
    for (const team of TEAMS) {
      const starters = TEAM_RESOURCE_STARTERS[team.id]
      expect(starters.length).toBeGreaterThanOrEqual(2)
      for (const starter of starters) {
        expect(starter.title.length).toBeGreaterThan(2)
        if (starter.kind === 'LINK') {
          expect(starter.url).toBeTruthy()
        }
      }
    }
  })
})
