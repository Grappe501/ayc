import { describe, expect, it } from 'vitest'
import {
  buildLocationCoverage,
  tallyApplicationStatuses,
} from './reports.ts'

describe('reports helpers', () => {
  it('marks locations thin when formal lead or pipeline is missing', () => {
    const rows = buildLocationCoverage([
      {
        id: '1',
        code: 'AAA',
        name: 'Alpha High',
        locationType: 'HIGH_SCHOOL',
        hasLocationLeadRole: false,
        rosterCount: 3,
        localLeadCandidates: 1,
        readyToLead: 0,
        categoryLeadsOnRoster: 0,
      },
      {
        id: '2',
        code: 'BBB',
        name: 'Beta High',
        locationType: 'HIGH_SCHOOL',
        hasLocationLeadRole: true,
        rosterCount: 2,
        localLeadCandidates: 0,
        readyToLead: 0,
        categoryLeadsOnRoster: 1,
      },
      {
        id: '3',
        code: 'CCC',
        name: 'Covered High',
        locationType: 'HIGH_SCHOOL',
        hasLocationLeadRole: true,
        rosterCount: 4,
        localLeadCandidates: 1,
        readyToLead: 1,
        categoryLeadsOnRoster: 1,
      },
    ])

    expect(rows[0]?.id).toBe('1')
    expect(rows[0]?.thinFormalLead).toBe(true)
    expect(rows[0]?.thin).toBe(true)
    expect(rows.find((row) => row.id === '2')?.thinPipeline).toBe(true)
    expect(rows.find((row) => row.id === '3')?.thin).toBe(false)
  })

  it('tallies application pipeline statuses', () => {
    const counts = tallyApplicationStatuses([
      'NEW',
      'NEW',
      'REVIEWING',
      'ACCEPTED',
      'DECLINED',
      'DUPLICATE',
    ])
    expect(counts.NEW).toBe(2)
    expect(counts.open).toBe(4)
    expect(counts.total).toBe(6)
    expect(counts.ACCEPTED).toBe(1)
  })
})
