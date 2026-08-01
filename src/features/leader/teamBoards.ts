import { TEAMS } from '@/content/ayc'
import type { LeaderRosterRow } from '@/features/leader/leaderApi'

export const TEAM_BOARD_SLUGS = TEAMS.map((team) => team.id)

export type TeamBoardSlug = (typeof TEAMS)[number]['id']

export function isTeamBoardSlug(value: string | undefined): value is TeamBoardSlug {
  return Boolean(value && TEAM_BOARD_SLUGS.includes(value as TeamBoardSlug))
}

export function getTeamBoardMeta(slug: TeamBoardSlug) {
  const team = TEAMS.find((entry) => entry.id === slug)
  if (!team) throw new Error(`Unknown team board: ${slug}`)
  return team
}

/** Position on this team (primary or additional). */
export function positionOnTeam(
  person: LeaderRosterRow,
  teamSlug: string,
): 'LEAD' | 'VOLUNTEER' | null {
  if (person.primaryTeam?.slug === teamSlug) {
    return person.primaryTeam.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER'
  }
  const extra = person.additionalTeams.find((team) => team.slug === teamSlug)
  if (!extra) return null
  return extra.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER'
}

export function summarizeTeamRoster(people: LeaderRosterRow[], teamSlug: string) {
  const leads = people.filter((person) => positionOnTeam(person, teamSlug) === 'LEAD')
  const volunteers = people.filter(
    (person) => positionOnTeam(person, teamSlug) === 'VOLUNTEER',
  )
  const locations = new Set(
    people.map((person) => person.location?.id).filter(Boolean),
  )
  const missingContact = people.filter((person) => person.missingContact).length
  const prospective = people.filter((person) => person.status === 'PROSPECTIVE').length
  const joinForm = people.filter(
    (person) => person.status === 'PROSPECTIVE' && person.source === 'JOIN_FORM',
  ).length
  const needsPreferred = people.filter((person) => person.needsPreferred).length
  const textReady = people.filter((person) => person.textReady).length
  const noLead = leads.length === 0

  return {
    roster: people.length,
    leads: leads.length,
    volunteers: volunteers.length,
    locationsRepresented: locations.size,
    missingContact,
    prospective,
    joinForm,
    needsPreferred,
    textReady,
    noLead,
    leadPeople: leads,
  }
}
