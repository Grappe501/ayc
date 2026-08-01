import { describe, expect, it } from 'vitest'
import {
  buildTeamAttentionDigests,
  sortDigestsByUrgency,
  type TeamDigestPerson,
} from './teamDigest.ts'

const TEAMS = [
  { slug: 'organizer', name: 'Organizer', mark: '01', shortLabel: 'Build' },
  { slug: 'outreach', name: 'Outreach', mark: '05', shortLabel: 'Open' },
]

function person(partial: Partial<TeamDigestPerson> & Pick<TeamDigestPerson, 'id'>): TeamDigestPerson {
  return {
    status: 'ACTIVE',
    source: 'LEADER_ENTRY',
    missingContact: false,
    needsPreferred: false,
    textReady: false,
    primaryTeam: null,
    additionalTeams: [],
    location: null,
    ...partial,
  }
}

describe('buildTeamAttentionDigests', () => {
  it('counts gaps, joins, and no-lead per team', () => {
    const people = [
      person({
        id: '1',
        primaryTeam: { slug: 'organizer', position: 'LEAD' },
        location: { id: 'loc1' },
      }),
      person({
        id: '2',
        missingContact: true,
        status: 'PROSPECTIVE',
        source: 'JOIN_FORM',
        primaryTeam: { slug: 'organizer', position: 'VOLUNTEER' },
      }),
      person({
        id: '3',
        needsPreferred: true,
        primaryTeam: { slug: 'outreach', position: 'VOLUNTEER' },
      }),
    ]

    const digests = buildTeamAttentionDigests(people, TEAMS)
    const organizer = digests.find((d) => d.slug === 'organizer')!
    const outreach = digests.find((d) => d.slug === 'outreach')!

    expect(organizer.roster).toBe(2)
    expect(organizer.leads).toBe(1)
    expect(organizer.missingContact).toBe(1)
    expect(organizer.joinForm).toBe(1)
    expect(organizer.noLead).toBe(false)
    expect(organizer.topIssues.some((issue) => /missing phone/i.test(issue))).toBe(true)

    expect(outreach.noLead).toBe(true)
    expect(outreach.needsPreferred).toBe(1)
    expect(outreach.topIssues).toContain('No lead assigned')
  })

  it('sorts by open items then no-lead', () => {
    const digests = buildTeamAttentionDigests(
      [
        person({
          id: '1',
          primaryTeam: { slug: 'organizer', position: 'LEAD' },
        }),
        person({
          id: '2',
          missingContact: true,
          primaryTeam: { slug: 'outreach', position: 'VOLUNTEER' },
        }),
      ],
      TEAMS,
    )
    const sorted = sortDigestsByUrgency(digests)
    expect(sorted[0]?.slug).toBe('outreach')
  })
})
