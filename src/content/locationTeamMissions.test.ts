import { describe, expect, it } from 'vitest'
import { getLocationTeamMission, LOCATION_TEAM_MISSIONS } from './locationTeamMissions'

describe('locationTeamMissions', () => {
  it('defines packs for HS, college, and county', () => {
    expect(Object.keys(LOCATION_TEAM_MISSIONS).sort()).toEqual([
      'COLLEGE',
      'COUNTY',
      'HIGH_SCHOOL',
    ])
  })

  it('returns local charge language, not empty shells', () => {
    for (const pack of Object.values(LOCATION_TEAM_MISSIONS)) {
      expect(pack.charge.length).toBeGreaterThan(10)
      expect(pack.focusAreas.length).toBeGreaterThan(0)
      expect(pack.leadOwns.length).toBeGreaterThan(0)
    }
  })

  it('resolves by location type', () => {
    expect(getLocationTeamMission('HIGH_SCHOOL').label).toBe('High school')
    expect(getLocationTeamMission('COUNTY').charge).toContain('county')
  })
})
