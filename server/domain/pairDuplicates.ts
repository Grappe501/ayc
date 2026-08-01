import type { DuplicateResult } from './enums.ts'
import { assessDuplicates, type DuplicateCandidate } from './duplicates.ts'

export type DuplicatePairStrength = Exclude<DuplicateResult, 'NO_MATCH'>

export type DuplicatePair = {
  leftId: string
  rightId: string
  result: DuplicatePairStrength
  reasons: string[]
  suggestedSurvivorId: string
}

export type SurvivorScoreInput = {
  id: string
  status: string
  hasEmail: boolean
  hasPhone: boolean
  createdAt: Date | string
}

const STRENGTH_RANK: Record<DuplicatePairStrength, number> = {
  EXACT_MATCH: 3,
  LIKELY_MATCH: 2,
  POSSIBLE_MATCH: 1,
}

function statusRank(status: string): number {
  if (status === 'ACTIVE') return 4
  if (status === 'PROSPECTIVE') return 3
  if (status === 'INACTIVE') return 2
  if (status === 'ARCHIVED') return 1
  return 0
}

/** Prefer active, more complete, older record as the merge survivor. */
export function preferSurvivorId(a: SurvivorScoreInput, b: SurvivorScoreInput): string {
  const aScore =
    statusRank(a.status) * 10 + (a.hasEmail ? 2 : 0) + (a.hasPhone ? 2 : 0)
  const bScore =
    statusRank(b.status) * 10 + (b.hasEmail ? 2 : 0) + (b.hasPhone ? 2 : 0)
  if (aScore !== bScore) return aScore >= bScore ? a.id : b.id

  const aCreated = new Date(a.createdAt).getTime()
  const bCreated = new Date(b.createdAt).getTime()
  if (aCreated !== bCreated) return aCreated <= bCreated ? a.id : b.id
  return a.id < b.id ? a.id : b.id
}

/**
 * Pairwise scan using existing assessDuplicates scoring.
 * Each unordered pair appears once; only POSSIBLE / LIKELY / EXACT.
 */
export function findDuplicatePairs(
  people: Array<
    DuplicateCandidate & {
      createdAt: Date | string
    }
  >,
  opts?: { maxPairs?: number },
): DuplicatePair[] {
  const maxPairs = opts?.maxPairs ?? 100
  const pairs: DuplicatePair[] = []
  const seen = new Set<string>()

  for (let i = 0; i < people.length; i += 1) {
    const left = people[i]!
    const probe = {
      firstName: left.firstName,
      lastName: left.lastName,
      preferredName: left.preferredName,
      email: left.emails[0] ?? null,
      phone: left.phones[0] ?? null,
      primaryLocationId: left.primaryLocationId,
      teamIds: left.teamIds,
    }

    const others = people.filter((p) => p.id !== left.id)
    const assessment = assessDuplicates(probe, others)
    if (assessment.result === 'NO_MATCH') continue

    for (const otherId of assessment.matchedCandidateIds) {
      const key = [left.id, otherId].sort().join(':')
      if (seen.has(key)) continue
      seen.add(key)

      const right = people.find((p) => p.id === otherId)
      if (!right) continue

      const pairAssessment = assessDuplicates(probe, [right])
      if (pairAssessment.result === 'NO_MATCH') continue

      const result = pairAssessment.result as DuplicatePairStrength
      const suggestedSurvivorId = preferSurvivorId(
        {
          id: left.id,
          status: left.status,
          hasEmail: left.emails.length > 0,
          hasPhone: left.phones.length > 0,
          createdAt: left.createdAt,
        },
        {
          id: right.id,
          status: right.status,
          hasEmail: right.emails.length > 0,
          hasPhone: right.phones.length > 0,
          createdAt: right.createdAt,
        },
      )

      pairs.push({
        leftId: left.id,
        rightId: right.id,
        result,
        reasons: pairAssessment.reasons,
        suggestedSurvivorId,
      })
    }
  }

  pairs.sort((a, b) => STRENGTH_RANK[b.result] - STRENGTH_RANK[a.result])
  return pairs.slice(0, maxPairs)
}
