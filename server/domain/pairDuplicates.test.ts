import { describe, expect, it } from 'vitest'
import { findDuplicatePairs, preferSurvivorId } from './pairDuplicates.ts'

describe('preferSurvivorId', () => {
  it('prefers ACTIVE over PROSPECTIVE', () => {
    const id = preferSurvivorId(
      {
        id: 'a',
        status: 'PROSPECTIVE',
        hasEmail: true,
        hasPhone: true,
        createdAt: '2026-01-01',
      },
      {
        id: 'b',
        status: 'ACTIVE',
        hasEmail: false,
        hasPhone: false,
        createdAt: '2026-06-01',
      },
    )
    expect(id).toBe('b')
  })

  it('prefers more complete contact when status ties', () => {
    const id = preferSurvivorId(
      {
        id: 'a',
        status: 'ACTIVE',
        hasEmail: true,
        hasPhone: true,
        createdAt: '2026-06-01',
      },
      {
        id: 'b',
        status: 'ACTIVE',
        hasEmail: true,
        hasPhone: false,
        createdAt: '2026-01-01',
      },
    )
    expect(id).toBe('a')
  })
})

describe('findDuplicatePairs', () => {
  it('returns one EXACT_MATCH pair for shared email', () => {
    const pairs = findDuplicatePairs([
      {
        id: 'p1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        preferredName: null,
        status: 'ACTIVE',
        emails: ['ada@example.com'],
        phones: [],
        primaryLocationId: 'loc1',
        teamIds: ['t1'],
        createdAt: '2026-01-01',
      },
      {
        id: 'p2',
        firstName: 'Ada',
        lastName: 'Lovelace',
        preferredName: null,
        status: 'PROSPECTIVE',
        emails: ['ada@example.com'],
        phones: ['5015550100'],
        primaryLocationId: 'loc1',
        teamIds: ['t1'],
        createdAt: '2026-06-01',
      },
    ])

    expect(pairs).toHaveLength(1)
    expect(pairs[0]?.result).toBe('EXACT_MATCH')
    expect(pairs[0]?.suggestedSurvivorId).toBe('p1')
  })

  it('does not emit NO_MATCH pairs', () => {
    const pairs = findDuplicatePairs([
      {
        id: 'p1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        preferredName: null,
        status: 'ACTIVE',
        emails: ['ada@example.com'],
        phones: [],
        createdAt: '2026-01-01',
      },
      {
        id: 'p2',
        firstName: 'Grace',
        lastName: 'Hopper',
        preferredName: null,
        status: 'ACTIVE',
        emails: ['grace@example.com'],
        phones: [],
        createdAt: '2026-01-02',
      },
    ])
    expect(pairs).toHaveLength(0)
  })
})
