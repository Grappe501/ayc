export type TeamDigestPerson = {
  id: string
  status: string
  source: string
  missingContact: boolean
  needsPreferred: boolean
  textReady: boolean
  primaryTeam: { slug: string; position: string } | null
  additionalTeams: Array<{ slug: string; position: string }>
  location: { id: string } | null
}

export type TeamDigestMeta = {
  slug: string
  name: string
  mark?: string
  shortLabel?: string
}

export type TeamAttentionDigest = {
  slug: string
  name: string
  mark: string
  shortLabel: string
  roster: number
  leads: number
  volunteers: number
  locationsRepresented: number
  missingContact: number
  prospective: number
  joinForm: number
  needsPreferred: number
  textReady: number
  noLead: boolean
  /** Actionable items a lead should clear (gaps + prospective + preferred + no lead). */
  openItems: number
  topIssues: string[]
}

function onTeam(person: TeamDigestPerson, teamSlug: string): boolean {
  return (
    person.primaryTeam?.slug === teamSlug ||
    person.additionalTeams.some((team) => team.slug === teamSlug)
  )
}

function positionOnTeam(
  person: TeamDigestPerson,
  teamSlug: string,
): 'LEAD' | 'VOLUNTEER' | null {
  if (person.primaryTeam?.slug === teamSlug) {
    return person.primaryTeam.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER'
  }
  const extra = person.additionalTeams.find((team) => team.slug === teamSlug)
  if (!extra) return null
  return extra.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER'
}

function buildTopIssues(digest: Omit<TeamAttentionDigest, 'topIssues' | 'openItems'>): {
  topIssues: string[]
  openItems: number
} {
  const topIssues: string[] = []

  if (digest.noLead) {
    topIssues.push('No lead assigned')
  }
  if (digest.missingContact > 0) {
    topIssues.push(`${digest.missingContact} missing phone/email`)
  }
  if (digest.joinForm > 0) {
    topIssues.push(`${digest.joinForm} new join applications`)
  } else if (digest.prospective > 0) {
    topIssues.push(`${digest.prospective} prospective`)
  }
  if (digest.needsPreferred > 0) {
    topIssues.push(`${digest.needsPreferred} need preferred contact`)
  }
  if (topIssues.length === 0 && digest.roster === 0) {
    topIssues.push('No one assigned yet')
  }
  if (topIssues.length === 0) {
    topIssues.push('Caught up')
  }

  // prospective includes join-form signups — count once
  const openItems =
    (digest.noLead ? 1 : 0) +
    digest.missingContact +
    digest.prospective +
    digest.needsPreferred

  return { topIssues: topIssues.slice(0, 4), openItems }
}

/** Build attention digests for each team from a full (or scoped) roster. */
export function buildTeamAttentionDigests(
  people: TeamDigestPerson[],
  teams: TeamDigestMeta[],
): TeamAttentionDigest[] {
  return teams.map((team) => {
    const members = people.filter((person) => onTeam(person, team.slug))
    const leads = members.filter((person) => positionOnTeam(person, team.slug) === 'LEAD')
    const volunteers = members.filter(
      (person) => positionOnTeam(person, team.slug) === 'VOLUNTEER',
    )
    const locations = new Set(
      members.map((person) => person.location?.id).filter(Boolean),
    )

    const base = {
      slug: team.slug,
      name: team.name,
      mark: team.mark ?? '',
      shortLabel: team.shortLabel ?? team.name,
      roster: members.length,
      leads: leads.length,
      volunteers: volunteers.length,
      locationsRepresented: locations.size,
      missingContact: members.filter((person) => person.missingContact).length,
      prospective: members.filter((person) => person.status === 'PROSPECTIVE').length,
      joinForm: members.filter(
        (person) => person.status === 'PROSPECTIVE' && person.source === 'JOIN_FORM',
      ).length,
      needsPreferred: members.filter((person) => person.needsPreferred).length,
      textReady: members.filter((person) => person.textReady).length,
      noLead: leads.length === 0,
    }

    const { topIssues, openItems } = buildTopIssues(base)
    return { ...base, topIssues, openItems }
  })
}

/** Sort digests so teams with the most open work float to the top. */
export function sortDigestsByUrgency(
  digests: TeamAttentionDigest[],
): TeamAttentionDigest[] {
  return [...digests].sort((a, b) => {
    if (b.openItems !== a.openItems) return b.openItems - a.openItems
    if (Number(b.noLead) !== Number(a.noLead)) return Number(b.noLead) - Number(a.noLead)
    return a.name.localeCompare(b.name)
  })
}
