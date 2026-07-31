import { describe, expect, it } from 'vitest'
import { CHANCE_BRADFORD, LEADERSHIP_ROSTER } from './leadershipRoster.ts'

describe('leadershipRoster', () => {
  it('includes Chance Bradford as board operator on Organizer', () => {
    expect(CHANCE_BRADFORD.firstName).toBe('Chance')
    expect(CHANCE_BRADFORD.lastName).toBe('Bradford')
    expect(CHANCE_BRADFORD.teams[0]).toMatchObject({
      slug: 'organizer',
      position: 'LEAD',
    })
    expect(LEADERSHIP_ROSTER[0]).toBe(CHANCE_BRADFORD)
  })

  it('maps intake people onto the five Phase 1 teams', () => {
    expect(LEADERSHIP_ROSTER.length).toBeGreaterThan(40)
    for (const person of LEADERSHIP_ROSTER) {
      expect(person.teams.length).toBeGreaterThan(0)
      expect(person.locationCode).toMatch(/^[A-Z]{3,4}$/)
      const primaryCount = person.teams.filter((t) => t.primary !== false).length
      expect(primaryCount).toBeGreaterThanOrEqual(1)
    }
  })
})
