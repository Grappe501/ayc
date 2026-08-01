import type { AycDatabase } from '../db/client.ts'
import { CANONICAL_TEAMS } from '../domain/enums.ts'
import {
  buildTeamAttentionDigests,
  sortDigestsByUrgency,
  type TeamAttentionDigest,
} from '../domain/teamDigest.ts'
import { listLeaderRoster } from './leaderRoster.ts'

const TEAM_META = CANONICAL_TEAMS.map((team, index) => ({
  slug: team.slug,
  name: team.name,
  mark: team.slug === 'graphic-design' ? 'GD' : String(index + 1).padStart(2, '0'),
  shortLabel: team.name,
}))

export async function listTeamAttentionDigests(db: AycDatabase): Promise<{
  generatedAt: string
  totalOpenItems: number
  teamsNeedingAttention: number
  digests: TeamAttentionDigest[]
}> {
  const roster = await listLeaderRoster(db, { status: 'ALL' })
  const digests = sortDigestsByUrgency(
    buildTeamAttentionDigests(roster.people, TEAM_META),
  )
  const totalOpenItems = digests.reduce((sum, team) => sum + team.openItems, 0)
  const teamsNeedingAttention = digests.filter((team) => team.openItems > 0).length

  return {
    generatedAt: new Date().toISOString(),
    totalOpenItems,
    teamsNeedingAttention,
    digests,
  }
}
