import { describe, expect, it } from 'vitest'
import { boardIdsForRollup, type BoardRollupRow } from './calendarRollup.ts'

const boards: BoardRollupRow[] = [
  { id: 'main', kind: 'MAIN', teamId: null, locationId: null, segment: null, parentBoardId: null },
  {
    id: 'org',
    kind: 'STATEWIDE_CATEGORY',
    teamId: 't-org',
    locationId: null,
    segment: null,
    parentBoardId: 'main',
  },
  {
    id: 'sm',
    kind: 'STATEWIDE_CATEGORY',
    teamId: 't-sm',
    locationId: null,
    segment: null,
    parentBoardId: 'main',
  },
  {
    id: 'gd',
    kind: 'SECONDARY',
    teamId: 't-gd',
    locationId: null,
    segment: null,
    parentBoardId: 'sm',
  },
  {
    id: 'hs',
    kind: 'SEGMENT',
    teamId: null,
    locationId: null,
    segment: 'HIGH_SCHOOL',
    parentBoardId: 'main',
  },
  {
    id: 'loc-team',
    kind: 'LOCATION_TEAM',
    teamId: null,
    locationId: 'loc1',
    segment: 'HIGH_SCHOOL',
    parentBoardId: 'hs',
  },
  {
    id: 'loc-org',
    kind: 'LOCATION_CATEGORY',
    teamId: 't-org',
    locationId: 'loc1',
    segment: 'HIGH_SCHOOL',
    parentBoardId: 'org',
  },
]

describe('calendar rollup board sets', () => {
  it('main includes every board', () => {
    expect(boardIdsForRollup(boards[0]!, boards)).toHaveLength(boards.length)
  })

  it('statewide category includes location categories for that team + secondary children', () => {
    const ids = boardIdsForRollup(boards[2]!, boards)
    expect(ids).toContain('sm')
    expect(ids).toContain('gd')
    expect(ids).not.toContain('loc-org')
  })

  it('organizer statewide includes location organizer boards', () => {
    const ids = boardIdsForRollup(boards[1]!, boards)
    expect(ids).toContain('org')
    expect(ids).toContain('loc-org')
  })

  it('location team includes its category boards', () => {
    const ids = boardIdsForRollup(boards[5]!, boards)
    expect(ids).toEqual(expect.arrayContaining(['loc-team', 'loc-org']))
    expect(ids).not.toContain('main')
  })

  it('segment includes matching location boards', () => {
    const ids = boardIdsForRollup(boards[4]!, boards)
    expect(ids).toEqual(expect.arrayContaining(['hs', 'loc-team', 'loc-org']))
  })
})
