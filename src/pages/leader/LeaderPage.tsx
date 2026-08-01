import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  StatCard,
  Tag,
} from '@/components/ui'
import { TEAMS } from '@/content/ayc'
import { AssignTeamDialog } from '@/features/leader/AssignTeamDialog'
import { LeaderRosterList } from '@/features/leader/LeaderRosterList'
import { teamBoardPath } from '@/features/leader/accessScope'
import { PIPELINE_TAG_OPTIONS } from '@/features/leader/pipelineLabels'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderRoster,
  fetchLeaderSummary,
  fetchTeamDigests,
  fetchTeams,
  type LeaderRosterRow,
  type TeamAttentionDigest,
} from '@/features/leader/leaderApi'
import './leader-board.css'

function LeaderBoard() {
  const [stats, setStats] = useState({
    activePeople: 0,
    leads: 0,
    volunteers: 0,
    locationsRepresented: 0,
  })
  const [people, setPeople] = useState<LeaderRosterRow[]>([])
  const [total, setTotal] = useState(0)
  const [attention, setAttention] = useState({
    missingContact: 0,
    prospective: 0,
    joinForm: 0,
    needsPreferred: 0,
    textReady: 0,
    readyToLead: 0,
    needsMentoring: 0,
    futureLeader: 0,
    localLeadCandidate: 0,
    categoryLeadCandidate: 0,
  })

  function clearPipelineAndContactFilters() {
    setPipelineFilter('ALL')
    setGapsOnly(false)
    setTextReadyOnly(false)
    setNeedsPreferredOnly(false)
  }
  const [teams, setTeams] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [digests, setDigests] = useState<TeamAttentionDigest[]>([])
  const [digestStats, setDigestStats] = useState({
    totalOpenItems: 0,
    teamsNeedingAttention: 0,
  })
  const [q, setQ] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [preferredFilter, setPreferredFilter] = useState('ALL')
  const [pipelineFilter, setPipelineFilter] = useState('ALL')
  const [gapsOnly, setGapsOnly] = useState(false)
  const [textReadyOnly, setTextReadyOnly] = useState(false)
  const [needsPreferredOnly, setNeedsPreferredOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assignPerson, setAssignPerson] = useState<LeaderRosterRow | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => setQ(searchDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const [summary, roster, teamResult, digestResult] = await Promise.all([
        fetchLeaderSummary(),
        fetchLeaderRoster({
          q: q || undefined,
          team: teamFilter || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          preferred: preferredFilter === 'ALL' ? undefined : preferredFilter,
          pipelineTag: pipelineFilter === 'ALL' ? undefined : pipelineFilter,
          gapsOnly,
          textReadyOnly,
          needsPreferredOnly,
        }),
        fetchTeams(),
        fetchTeamDigests(),
      ])
      if (cancelled) return
      if (!summary.ok) {
        setError(summary.error.message)
        setLoading(false)
        return
      }
      setStats(summary.data)
      if (teamResult.ok) setTeams(teamResult.data)
      if (digestResult.ok) {
        setDigests(digestResult.data.digests)
        setDigestStats({
          totalOpenItems: digestResult.data.totalOpenItems,
          teamsNeedingAttention: digestResult.data.teamsNeedingAttention,
        })
      }
      if (!roster.ok) {
        setError(roster.error.message)
        setLoading(false)
        return
      }
      setPeople(roster.data.people)
      setTotal(roster.data.total)
      setAttention(roster.data.attention)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [
    q,
    teamFilter,
    statusFilter,
    preferredFilter,
    pipelineFilter,
    gapsOnly,
    textReadyOnly,
    needsPreferredOnly,
  ])

  const chance = useMemo(
    () => people.find((p) => p.firstName === 'Chance' && p.lastName === 'Bradford'),
    [people],
  )

  return (
    <div>
      <PageHeader
        eyebrow="Leader Board"
        title="Leader Board"
        lede="Chance Bradford’s workspace to build the AYC contact list, fill missing phone and email, and assign people to teams."
        actions={
          <>
            <Button to="/leader/gaps" variant="primary">
              Fill contact gaps
            </Button>
            <Button to="/leader/duplicates" variant="secondary">
              Review duplicates
            </Button>
            <Button to="/leader/feedback" variant="secondary">
              Feedback inbox
            </Button>
            <Button to="/leader/contacts/new" variant="secondary">
              Add a Contact
            </Button>
            <Button to="/directory" variant="secondary">
              View Directory
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                clearLeaderSession()
                window.location.assign('/leader')
              }}
            >
              Lock Board
            </Button>
          </>
        }
      />

      {chance ? (
        <p className="field__hint" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
          Operator on file: <strong>{chance.displayName}</strong>
          {chance.primaryTeam ? ` · ${chance.primaryTeam.name} Lead` : null}
        </p>
      ) : null}

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(stats.activePeople)} label="Active People" />
        <StatCard value={String(stats.leads)} label="Leads" />
        <StatCard value={String(stats.volunteers)} label="Volunteers" />
        <StatCard value={String(stats.locationsRepresented)} label="Locations Represented" />
      </div>

      <Section id="hierarchy" title="Leadership hierarchy">
        <p className="field__hint" style={{ marginBottom: '1rem' }}>
          Lead Organizer command board. Category boards are statewide; Graphic Design sits under
          Social Media; HS and Working Class segment shells develop location leadership.
        </p>
        <div className="leader-attention">
          <Card>
            <Tag>Category</Tag>
            <h3>Statewide category boards</h3>
            <p>Organizer, Voter Registration, Social Media, Events, Outreach.</p>
            <div className="btn-row">
              {TEAMS.map((team) => (
                <Button key={team.id} to={`/leader/teams/${team.id}`} variant="secondary">
                  {team.name}
                </Button>
              ))}
            </div>
          </Card>
          <Card>
            <Tag>Secondary</Tag>
            <h3>Graphic Design</h3>
            <p>Statewide designers under Social Media — own roster, rolls into Social Media.</p>
            <Button to="/leader/teams/social-media/graphic-design" variant="primary">
              Open Graphic Design
            </Button>
          </Card>
          <Card>
            <Tag>Segment</Tag>
            <h3>High School Lead Organizer</h3>
            <p>Full HS workspace — develop-local-leads queue, school coverage, location TEAM boards.</p>
            <Button to="/leader/segments/high-school" variant="primary">
              Open HS workspace
            </Button>
          </Card>
          <Card>
            <Tag>Segment</Tag>
            <h3>Working Class Lead Organizer</h3>
            <p>Full WC workspace — develop-local-leads queue, county coverage, location TEAM boards.</p>
            <Button to="/leader/segments/working-class" variant="primary">
              Open WC workspace
            </Button>
          </Card>
          <Card>
            <Tag>Locations</Tag>
            <h3>Location TEAM boards</h3>
            <p>
              Every school, campus, and county has a TEAM board plus five category boards. Open from
              HS / WC segment lists, or from a contact’s location.
            </p>
            <div className="btn-row">
              <Button to="/leader/segments/high-school" variant="secondary">
                HS locations
              </Button>
              <Button to="/leader/segments/working-class" variant="secondary">
                County locations
              </Button>
              <Button to="/directory" variant="secondary">
                Directory
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="team-digests" title="Team attention digests">
        <p className="field__hint" style={{ marginBottom: '1rem' }}>
          Per-team snapshot for Chance and category leads — gaps, joins, preferred contact, and
          missing leads. Sorted by who needs work first.
          {digestStats.teamsNeedingAttention > 0
            ? ` ${digestStats.teamsNeedingAttention} team${digestStats.teamsNeedingAttention === 1 ? '' : 's'} need attention (${digestStats.totalOpenItems} open items).`
            : ' All teams look caught up.'}
        </p>
        <div className="team-digest-grid">
          {(digests.length > 0
            ? digests
            : TEAMS.map((team) => ({
                slug: team.id,
                name: team.name,
                mark: team.mark,
                shortLabel: team.shortLabel,
                roster: 0,
                leads: 0,
                volunteers: 0,
                locationsRepresented: 0,
                missingContact: 0,
                prospective: 0,
                joinForm: 0,
                needsPreferred: 0,
                textReady: 0,
                noLead: true,
                openItems: 0,
                topIssues: ['Loading…'],
              }))
          ).map((digest) => (
            <Card
              key={digest.slug}
              className={
                digest.openItems > 0
                  ? 'team-digest-card team-digest-card--needs-work'
                  : 'team-digest-card'
              }
            >
              <div className="team-digest-card__top">
                <span className="team-board-hub__mark">{digest.mark}</span>
                {digest.openItems > 0 ? (
                  <Tag>{digest.openItems} open</Tag>
                ) : (
                  <Tag>Caught up</Tag>
                )}
              </div>
              <h3>{digest.name}</h3>
              <p className="field__hint">
                {digest.roster} on roster · {digest.leads} lead
                {digest.leads === 1 ? '' : 's'} · {digest.textReady} text-ready
              </p>
              <ul className="team-digest-issues">
                {digest.topIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
              <div className="btn-row">
                <Button to={teamBoardPath(digest.slug)} variant="primary">
                  Open board
                </Button>
                <Button to={`${teamBoardPath(digest.slug)}#mission`} variant="secondary">
                  Mission
                </Button>
                {digest.missingContact > 0 ? (
                  <Button to="/leader/gaps" variant="secondary">
                    Gap fill
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="attention" title="Needs attention">
        <div className="leader-attention">
          {attention.joinForm > 0 ? (
            <Card>
              <Tag>Join form</Tag>
              <h3>{attention.joinForm} new join applications</h3>
              <p>
                Public `/join` signups land here as <strong>Prospective</strong> on their chosen
                team board. Open the record, confirm details, then activate.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setStatusFilter('PROSPECTIVE')
                  clearPipelineAndContactFilters()
                }}
              >
                Show join prospectives
              </Button>
            </Card>
          ) : null}
          {attention.missingContact > 0 ? (
            <Card>
              <Tag>Contact gaps</Tag>
              <h3>{attention.missingContact} missing phone & email</h3>
              <p>Run the gap-fill sprint: one person at a time, save phone and/or email, next.</p>
              <div className="btn-row">
                <Button to="/leader/gaps" variant="primary">
                  Start gap fill
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    clearPipelineAndContactFilters()
                    setGapsOnly(true)
                    setStatusFilter('ALL')
                  }}
                >
                  Show in list
                </Button>
              </div>
            </Card>
          ) : null}
          <Card>
            <Tag>Duplicates</Tag>
            <h3>Review possible duplicate people</h3>
            <p>
              Exact email/phone and same-name matches can be merged into one survivor record.
            </p>
            <Button to="/leader/duplicates" variant="primary">
              Open duplicate review
            </Button>
          </Card>
          {attention.prospective > 0 ? (
            <Card>
              <Tag>Prospective</Tag>
              <h3>{attention.prospective} prospective records</h3>
              <p>Confirm team placement and activate when ready — includes Join form signups.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStatusFilter('PROSPECTIVE')
                  clearPipelineAndContactFilters()
                }}
              >
                Show prospective
              </Button>
            </Card>
          ) : null}
          {attention.needsPreferred > 0 ? (
            <Card>
              <Tag>Preferred contact</Tag>
              <h3>{attention.needsPreferred} need preferred method</h3>
              <p>
                They have phone or email, but preferred contact is still Unknown. Set Text / Email
                / Either so outreach is clear.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  clearPipelineAndContactFilters()
                  setNeedsPreferredOnly(true)
                  setStatusFilter('ALL')
                }}
              >
                Show needs preferred
              </Button>
            </Card>
          ) : null}
          <Card>
            <Tag>Text-ready</Tag>
            <h3>{attention.textReady} text-ready contacts</h3>
            <p>Phone on file and prefer Text or Either — ready for outreach lists.</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTextReadyOnly(true)
                setNeedsPreferredOnly(false)
                setGapsOnly(false)
                setPipelineFilter('ALL')
              }}
            >
              Show text-ready
            </Button>
          </Card>
          {attention.readyToLead > 0 ? (
            <Card>
              <Tag>Pipeline</Tag>
              <h3>{attention.readyToLead} ready to lead</h3>
              <p>Tagged as ready for more responsibility — review for lead placement.</p>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  clearPipelineAndContactFilters()
                  setPipelineFilter('READY_TO_LEAD')
                  setStatusFilter('ALL')
                }}
              >
                Show ready to lead
              </Button>
            </Card>
          ) : null}
          {attention.needsMentoring > 0 ? (
            <Card>
              <Tag>Pipeline</Tag>
              <h3>{attention.needsMentoring} need mentoring</h3>
              <p>Marked for coaching before they take on more lead work.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  clearPipelineAndContactFilters()
                  setPipelineFilter('NEEDS_MENTORING')
                  setStatusFilter('ALL')
                }}
              >
                Show needs mentoring
              </Button>
            </Card>
          ) : null}
          {attention.futureLeader > 0 ? (
            <Card>
              <Tag>Pipeline</Tag>
              <h3>{attention.futureLeader} future leaders</h3>
              <p>Longer-horizon pipeline — keep developing and watching progress.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  clearPipelineAndContactFilters()
                  setPipelineFilter('FUTURE_LEADER')
                  setStatusFilter('ALL')
                }}
              >
                Show future leaders
              </Button>
            </Card>
          ) : null}
        </div>
      </Section>

      <Section id="roster" title="Contact list">
        <div className="leader-board-filters">
          <Field id="roster-q" label="Search">
            <Input
              id="roster-q"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, school, team, or code"
            />
          </Field>
          <Field id="roster-team" label="Team">
            <Select
              id="roster-team"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="">All teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.slug}>
                  {team.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="roster-status" label="Status">
            <Select
              id="roster-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All non-archived</option>
              <option value="ACTIVE">Active</option>
              <option value="PROSPECTIVE">Prospective</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>
          <Field id="roster-preferred" label="Preferred contact">
            <Select
              id="roster-preferred"
              value={preferredFilter}
              onChange={(e) => setPreferredFilter(e.target.value)}
            >
              <option value="ALL">Any</option>
              <option value="TEXT">Text</option>
              <option value="EMAIL">Email</option>
              <option value="EITHER">Either</option>
              <option value="UNKNOWN">Unknown</option>
            </Select>
          </Field>
          <Field id="roster-pipeline" label="Pipeline tag">
            <Select
              id="roster-pipeline"
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
            >
              <option value="ALL">Any</option>
              {PIPELINE_TAG_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={gapsOnly}
              onChange={(e) => setGapsOnly(e.target.checked)}
            />
            Gaps only
          </label>
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={textReadyOnly}
              onChange={(e) => {
                setTextReadyOnly(e.target.checked)
                if (e.target.checked) setNeedsPreferredOnly(false)
              }}
            />
            Text-ready only
          </label>
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={needsPreferredOnly}
              onChange={(e) => {
                setNeedsPreferredOnly(e.target.checked)
                if (e.target.checked) setTextReadyOnly(false)
              }}
            />
            Needs preferred
          </label>
        </div>

        <p className="field__hint" aria-live="polite">
          {loading ? 'Loading…' : `${total} ${total === 1 ? 'person' : 'people'}`}
        </p>

        {loading ? <LoadingState label="Loading contact list…" /> : null}

        {!loading ? (
          <LeaderRosterList
            people={people}
            emptyTitle="No contacts match these filters."
            emptyDescription="Add a contact or clear filters. After DATABASE_URL is set, run npm run db:seed-roster to load the leadership intake list."
            emptyBadge="Chance Bradford board"
            onAssign={setAssignPerson}
          />
        ) : null}
      </Section>

      <Section id="quick" title="Quick actions">
        <div className="btn-row">
          <Button to="/leader/gaps" variant="primary">
            Fill contact gaps
          </Button>
          <Button to="/leader/feedback" variant="secondary">
            Feedback inbox
          </Button>
          <Button to="/leader/contacts/new" variant="secondary">
            Add Contact
          </Button>
          <Button to="/directory" variant="secondary">
            Search Directory
          </Button>
          <Button to="/feedback" variant="secondary">
            Send Beta Feedback
          </Button>
        </div>
      </Section>

      <AssignTeamDialog
        open={Boolean(assignPerson)}
        person={assignPerson}
        onClose={() => setAssignPerson(null)}
        onAssigned={(row) => {
          setPeople((prev) => prev.map((p) => (p.id === row.id ? row : p)))
        }}
      />
    </div>
  )
}

export function LeaderPage() {
  return (
    <RequireLeaderAccess requireStatewide>
      <LeaderBoard />
    </RequireLeaderAccess>
  )
}
