import { describe, expect, it } from 'vitest'
import {
  assessDuplicates,
  requiresConfirmation,
  shouldBlockCreation,
  type DuplicateCandidate,
} from './duplicates.ts'

const baseCandidate = (overrides: Partial<DuplicateCandidate> = {}): DuplicateCandidate => ({
  id: 'p1',
  firstName: 'Alex',
  lastName: 'Rivera',
  status: 'ACTIVE',
  emails: ['alex@example.com'],
  phones: ['15015551234'],
  primaryLocationId: 'loc-1',
  teamIds: ['team-1'],
  ...overrides,
})

describe('assessDuplicates', () => {
  it('returns EXACT_MATCH on normalized email', () => {
    const result = assessDuplicates(
      { firstName: 'Sam', lastName: 'Other', email: ' Alex@Example.com ' },
      [baseCandidate()],
    )
    expect(result.result).toBe('EXACT_MATCH')
    expect(shouldBlockCreation(result.result)).toBe(true)
  })

  it('returns EXACT_MATCH on normalized phone', () => {
    const result = assessDuplicates(
      { firstName: 'Sam', lastName: 'Other', phone: '(501) 555-1234' },
      [baseCandidate()],
    )
    expect(result.result).toBe('EXACT_MATCH')
  })

  it('returns LIKELY_MATCH for same name and location', () => {
    const result = assessDuplicates(
      {
        firstName: 'Alex',
        lastName: 'Rivera',
        primaryLocationId: 'loc-1',
      },
      [baseCandidate({ emails: [], phones: [] })],
    )
    expect(result.result).toBe('LIKELY_MATCH')
    expect(requiresConfirmation(result.result)).toBe(true)
  })

  it('returns POSSIBLE_MATCH for same name alone', () => {
    const result = assessDuplicates(
      { firstName: 'Alex', lastName: 'Rivera' },
      [baseCandidate({ emails: [], phones: [], primaryLocationId: null })],
    )
    expect(result.result).toBe('POSSIBLE_MATCH')
  })

  it('returns NO_MATCH when nothing overlaps', () => {
    const result = assessDuplicates(
      { firstName: 'Jordan', lastName: 'Lee', email: 'jordan@ayc.org' },
      [baseCandidate()],
    )
    expect(result.result).toBe('NO_MATCH')
    expect(result.matchedCandidateIds).toHaveLength(0)
  })
})
