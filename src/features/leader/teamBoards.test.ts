import { describe, expect, it } from 'vitest'
import {
  getTeamBoardMeta,
  isTeamBoardSlug,
  positionOnTeam,
  summarizeTeamRoster,
  TEAM_BOARD_SLUGS,
} from './teamBoards'
import type { LeaderRosterRow } from './leaderApi'

function row(
  partial: Partial<LeaderRosterRow> & Pick<LeaderRosterRow, 'id' | 'displayName'>,
): LeaderRosterRow {
  return {
    firstName: 'A',
    lastName: 'B',
    preferredName: null,
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: '',
    hasEmail: true,
    hasPhone: true,
    missingContact: false,
    location: null,
    primaryTeam: null,
    additionalTeams: [],
    ...partial,
  }
}

describe('teamBoards', () => {
  it('exposes the five Phase 1 team board slugs', () => {
    expect(TEAM_BOARD_SLUGS).toEqual([
      'organizer',
      'voter-registration',
      'social-media',
      'events',
      'outreach',
    ])
    expect(isTeamBoardSlug('social-media')).toBe(true)
    expect(isTeamBoardSlug('admin')).toBe(false)
    expect(getTeamBoardMeta('organizer').name).toBe('Organizer')
  })

  it('summarizes leads and gaps for a team roster', () => {
    const people = [
      row({
        id: '1',
        displayName: 'Lead One',
        primaryTeam: {
          id: 't',
          name: 'Organizer',
          slug: 'organizer',
          position: 'LEAD',
        },
      }),
      row({
        id: '2',
        displayName: 'Vol Two',
        missingContact: true,
        hasEmail: false,
        hasPhone: false,
        primaryTeam: {
          id: 't',
          name: 'Organizer',
          slug: 'organizer',
          position: 'VOLUNTEER',
        },
      }),
      row({
        id: '3',
        displayName: 'Extra Lead',
        primaryTeam: {
          id: 'o',
          name: 'Outreach',
          slug: 'outreach',
          position: 'VOLUNTEER',
        },
        additionalTeams: [
          { id: 't', name: 'Organizer', slug: 'organizer', position: 'LEAD' },
        ],
      }),
    ]

    expect(positionOnTeam(people[2]!, 'organizer')).toBe('LEAD')
    const summary = summarizeTeamRoster(people, 'organizer')
    expect(summary.leads).toBe(2)
    expect(summary.volunteers).toBe(1)
    expect(summary.missingContact).toBe(1)
    expect(summary.leadPeople.map((p) => p.displayName)).toEqual([
      'Lead One',
      'Extra Lead',
    ])
  })
})
