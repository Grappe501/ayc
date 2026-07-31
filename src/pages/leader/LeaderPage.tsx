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
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderRoster,
  fetchLeaderSummary,
  fetchTeams,
  type LeaderRosterRow,
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
  const [attention, setAttention] = useState({ missingContact: 0, prospective: 0 })
  const [teams, setTeams] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [q, setQ] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [gapsOnly, setGapsOnly] = useState(false)
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
      const [summary, roster, teamResult] = await Promise.all([
        fetchLeaderSummary(),
        fetchLeaderRoster({
          q: q || undefined,
          team: teamFilter || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          gapsOnly,
        }),
        fetchTeams(),
      ])
      if (cancelled) return
      if (!summary.ok) {
        setError(summary.error.message)
        setLoading(false)
        return
      }
      setStats(summary.data)
      if (teamResult.ok) setTeams(teamResult.data)
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
  }, [q, teamFilter, statusFilter, gapsOnly])

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
            <Button to="/leader/contacts/new" variant="primary">
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

      <Section id="team-boards" title="Team Lead Boards">
        <p className="field__hint" style={{ marginBottom: '1rem' }}>
          Open a team board to manage that team’s leads, volunteers, and contact gaps.
        </p>
        <div className="team-board-hub">
          {TEAMS.map((team) => (
            <Card key={team.id}>
              <span className="team-board-hub__mark">{team.mark}</span>
              <h3>{team.name} Lead</h3>
              <p>{team.shortLabel}</p>
              <Button to={`/leader/teams/${team.id}`} variant="primary">
                Open {team.name} board
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="attention" title="Needs attention">
        {attention.missingContact === 0 && attention.prospective === 0 ? (
          <p className="field__hint">Nothing needs attention right now.</p>
        ) : (
          <div className="leader-attention">
            <Card>
              <Tag>Contact gaps</Tag>
              <h3>{attention.missingContact} missing phone & email</h3>
              <p>Open a contact to fill text/phone when you have it.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setGapsOnly(true)
                  setStatusFilter('ALL')
                }}
              >
                Show gaps
              </Button>
            </Card>
            <Card>
              <Tag>Prospective</Tag>
              <h3>{attention.prospective} prospective records</h3>
              <p>Confirm team placement and activate when ready.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStatusFilter('PROSPECTIVE')
                  setGapsOnly(false)
                }}
              >
                Show prospective
              </Button>
            </Card>
          </div>
        )}
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
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={gapsOnly}
              onChange={(e) => setGapsOnly(e.target.checked)}
            />
            Gaps only
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
          <Button to="/leader/contacts/new" variant="primary">
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
    <RequireLeaderAccess>
      <LeaderBoard />
    </RequireLeaderAccess>
  )
}
