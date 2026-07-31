import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  StatCard,
  Tag,
} from '@/components/ui'
import { AssignTeamDialog } from '@/features/leader/AssignTeamDialog'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderRoster,
  fetchLeaderSummary,
  fetchTeams,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import './leader-board.css'

function labelStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

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

        {!loading && people.length === 0 ? (
          <EmptyState
            icon="+"
            title="No contacts match these filters."
            description="Add a contact or clear filters. After DATABASE_URL is set, run npm run db:seed-roster to load the leadership intake list."
            actionTo="/leader/contacts/new"
            actionLabel="Add a Contact"
          >
            <Badge tone="gold">Chance Bradford board</Badge>
          </EmptyState>
        ) : null}

        {!loading && people.length > 0 ? (
          <>
            <div className="leader-roster-desktop leader-roster-table-wrap">
              <table className="leader-roster-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Primary team</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <strong>{person.displayName}</strong>
                        {person.additionalTeams.length > 0 ? (
                          <div className="field__hint">
                            Also:{' '}
                            {person.additionalTeams.map((t) => t.name).join(', ')}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        {person.location
                          ? `${person.location.code} · ${person.location.name}`
                          : '—'}
                      </td>
                      <td>
                        {person.primaryTeam ? (
                          <>
                            {person.primaryTeam.name}
                            <div className="field__hint">
                              {person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}
                            </div>
                          </>
                        ) : (
                          <span className="leader-gap">Assign team</span>
                        )}
                      </td>
                      <td>
                        {person.missingContact ? (
                          <span className="leader-gap">Needs phone/email</span>
                        ) : (
                          <>
                            {person.hasEmail ? 'Email · ' : ''}
                            {person.hasPhone ? 'Phone' : ''}
                          </>
                        )}
                      </td>
                      <td>{labelStatus(person.status)}</td>
                      <td>
                        <div className="btn-row">
                          <Button
                            to={`/leader/contacts/${person.id}`}
                            variant="secondary"
                          >
                            {person.missingContact ? 'Fill contact' : 'Open'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => setAssignPerson(person)}
                          >
                            Assign team
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="leader-roster-mobile">
              {people.map((person) => (
                <Card key={person.id}>
                  <Tag>{labelStatus(person.status)}</Tag>
                  <h3>{person.displayName}</h3>
                  <p>
                    {person.location
                      ? `${person.location.code} · ${person.location.name}`
                      : 'No location'}
                  </p>
                  <p>
                    {person.primaryTeam
                      ? `${person.primaryTeam.name} · ${person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}`
                      : 'No team assigned'}
                  </p>
                  {person.missingContact ? (
                    <p className="leader-gap">Needs phone/email</p>
                  ) : null}
                  <div className="btn-row">
                    <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                      {person.missingContact ? 'Fill contact' : 'Open'}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setAssignPerson(person)}
                    >
                      Assign team
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
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
