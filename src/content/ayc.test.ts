import { describe, expect, it } from 'vitest'
import { AYC_MISSION, AYC_MISSION_HIGHLIGHTS, TEAMS } from './ayc'
import { splitMissionParagraphs } from './missionFormat'

describe('AYC content', () => {
  it('preserves the canonical mission statement', () => {
    expect(AYC_MISSION).toContain('Youth (16 - 24)')
    expect(AYC_MISSION).toContain('Natural State')
    expect(AYC_MISSION).toContain('young people from all walks of life')
  })

  it('defines five Phase 1 teams', () => {
    expect(TEAMS).toHaveLength(5)
    expect(TEAMS.map((t) => t.name)).toEqual([
      'Organizer',
      'Voter Registration',
      'Social Media',
      'Events',
      'Outreach',
    ])
  })

  it('only highlights phrases that exist in the mission', () => {
    for (const phrase of AYC_MISSION_HIGHLIGHTS) {
      expect(AYC_MISSION.includes(phrase)).toBe(true)
    }
  })

  it('splits mission without losing characters', () => {
    const parts = splitMissionParagraphs(AYC_MISSION)
    expect(parts.join(' ')).toBe(AYC_MISSION)
  })
})
