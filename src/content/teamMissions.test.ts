import { describe, expect, it } from 'vitest'
import { ALL_TEAM_BOARDS } from './boardTeams'
import { getTeamMission, TEAM_MISSIONS, listTeamMissionSlugs } from './teamMissions'

describe('team missions', () => {
  it('covers every team board slug including Graphic Design', () => {
    expect(listTeamMissionSlugs()).toEqual(ALL_TEAM_BOARDS.map((team) => team.id))
    for (const team of ALL_TEAM_BOARDS) {
      expect(TEAM_MISSIONS[team.id]).toBeDefined()
      const mission = getTeamMission(team.id)
      expect(mission.charge.length).toBeGreaterThan(10)
      expect(mission.purpose.length).toBeGreaterThan(40)
      expect(mission.focusAreas.length).toBeGreaterThanOrEqual(3)
      expect(mission.leadOwns.length).toBeGreaterThanOrEqual(2)
      expect(mission.successLooksLike.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('does not rewrite the canonical AYC mission statement', () => {
    for (const mission of Object.values(TEAM_MISSIONS)) {
      expect(mission.purpose).not.toMatch(/To unite young people from all walks of life/)
      expect(mission.servesCoalition).not.toMatch(/To unite young people from all walks of life/)
    }
  })
})
