import { TEAMS } from '@/content/ayc'

/** Secondary team under Social Media — not one of the five public category cards. */
export const GRAPHIC_DESIGN_TEAM = {
  id: 'graphic-design',
  name: 'Graphic Design',
  shortLabel: 'Make it clear',
  description:
    'Create clear visuals and design assets for the coalition. Statewide designers sit here under Social Media.',
  mark: 'GD',
  parentTeamId: 'social-media' as const,
} as const

/** All team boards that have a roster surface (five categories + Graphic Design). */
export const ALL_TEAM_BOARDS = [...TEAMS, GRAPHIC_DESIGN_TEAM] as const

export type AnyTeamBoardId = (typeof ALL_TEAM_BOARDS)[number]['id']

export function getAnyTeamBoard(id: string) {
  return ALL_TEAM_BOARDS.find((team) => team.id === id)
}
