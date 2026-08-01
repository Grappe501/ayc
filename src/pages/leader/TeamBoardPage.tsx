import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
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
import { AssignTeamDialog } from '@/features/leader/AssignTeamDialog'
import { LeaderRosterList } from '@/features/leader/LeaderRosterList'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderRoster,
  fetchTeams,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import {
  getTeamBoardMeta,
  isTeamBoardSlug,
  summarizeTeamRoster,
  TEAM_BOARD_SLUGS,
  type TeamBoardSlug,
} from '@/features/leader/teamBoards'
import { TEAMS } from '@/content/ayc'
import './leader-board.css'

function TeamBoard({ teamSlug }: { teamSlug: TeamBoardSlug }) {
  const meta = getTeamBoardMeta(teamSlug)
  const [people, setPeople] = useState<LeaderRosterRow[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [gapsOnly, setGapsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assignPerson, setAssignPerson] = useState<LeaderRosterRow | null>(null)
  const [teamId, setTeamId] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => setQ(searchDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const [roster, teamResult] = await Promise.all([
        fetchLeaderRoster({
          q: q || undefined,
          team: teamSlug,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          gapsOnly,
        }),
        fetchTeams(),
      ])
      if (cancelled) return
      if (teamResult.ok) {
        const match = teamResult.data.find((team) => team.slug === teamSlug)
        setTeamId(match?.id ?? '')
      }
      if (!roster.ok) {
        setError(roster.error.message)
        setLoading(false)
        return
      }
      setPeople(roster.data.people)
      setTotal(roster.data.total)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [q, teamSlug, statusFilter, gapsOnly])

  const summary = useMemo(
    () => summarizeTeamRoster(people, teamSlug),
    [people, teamSlug],
  )

  return (
    <div className={`team-board team-board--${teamSlug}`}>
      <PageHeader
        eyebrow="Team Lead Board"
        title={`${meta.name} Lead Board`}
        lede={`${meta.shortLabel}. ${meta.description} Fill contact gaps and assign people to this team.`}
        actions={
          <>
            <Button to="/leader" variant="secondary">
              All teams
            </Button>
            <Button to="/leader/contacts/new" variant="primary">
              Add a Contact
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

      <nav className="team-board-switcher" aria-label="Team boards">
        {TEAMS.map((team) => (
          <Link
            key={team.id}
            to={`/leader/teams/${team.id}`}
            className={
              team.id === teamSlug
                ? 'team-board-switcher__link team-board-switcher__link--active'
                : 'team-board-switcher__link'
            }
          >
            <span className="team-board-switcher__mark">{team.mark}</span>
            {team.name}
          </Link>
        ))}
      </nav>

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(summary.roster)} label="On this team" />
        <StatCard value={String(summary.leads)} label="Leads" />
        <StatCard value={String(summary.volunteers)} label="Volunteers" />
        <StatCard value={String(summary.locationsRepresented)} label="Locations" />
      </div>

      <Section id="leads" title={`${meta.name} leads`}>
        {loading ? <LoadingState label="Loading leads…" /> : null}
        {!loading && summary.leadPeople.length === 0 ? (
          <p className="field__hint">
            No leads assigned yet. Use Assign team to name a {meta.name} Lead.
          </p>
        ) : null}
        {!loading && summary.leadPeople.length > 0 ? (
          <div className="team-board-leads">
            {summary.leadPeople.map((person) => (
              <Card key={person.id}>
                <Tag>Lead</Tag>
                <h3>{person.displayName}</h3>
                <p>
                  {person.location
                    ? `${person.location.code} · ${person.location.name}`
                    : 'Location TBD'}
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
        ) : null}
      </Section>

      <Section id="attention" title="Needs attention">
        {summary.missingContact === 0 && summary.prospective === 0 ? (
          <p className="field__hint">Nothing needs attention on this team right now.</p>
        ) : (
          <div className="leader-attention">
            <Card>
              <Tag>Contact gaps</Tag>
              <h3>
                {summary.missingContact} missing phone & email
              </h3>
              <p>Fill text/phone so this team can reach its people.</p>
              <div className="btn-row">
                <Button to={`/leader/gaps`} variant="primary">
                  Start gap fill
                </Button>
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
              </div>
            </Card>
            <Card>
              <Tag>Prospective</Tag>
              <h3>{summary.prospective} prospective records</h3>
              <p>Confirm placement and activate when ready.</p>
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

      <Section id="roster" title={`${meta.name} roster`}>
        <div className="leader-board-filters leader-board-filters--team">
          <Field id="team-roster-q" label="Search">
            <Input
              id="team-roster-q"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, school, or code"
            />
          </Field>
          <Field id="team-roster-status" label="Status">
            <Select
              id="team-roster-status"
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
          {loading ? 'Loading…' : `${total} ${total === 1 ? 'person' : 'people'} on ${meta.name}`}
        </p>

        {loading ? <LoadingState label="Loading team roster…" /> : null}

        {!loading ? (
          <LeaderRosterList
            people={people}
            focusTeamSlug={teamSlug}
            emptyTitle={`No one on ${meta.name} yet.`}
            emptyDescription="Assign people to this team from the roster, or add a new contact."
            emptyBadge={`${meta.name} Lead Board`}
            onAssign={setAssignPerson}
          />
        ) : null}
      </Section>

      <Section id="other-teams" title="Other team boards">
        <div className="team-board-hub">
          {TEAM_BOARD_SLUGS.filter((slug) => slug !== teamSlug).map((slug) => {
            const other = getTeamBoardMeta(slug)
            return (
              <Card key={slug}>
                <span className="team-board-hub__mark">{other.mark}</span>
                <h3>{other.name}</h3>
                <p>{other.shortLabel}</p>
                <Button to={`/leader/teams/${slug}`} variant="secondary">
                  Open board
                </Button>
              </Card>
            )
          })}
        </div>
      </Section>

      <AssignTeamDialog
        open={Boolean(assignPerson)}
        person={assignPerson}
        defaultTeamId={teamId || undefined}
        onClose={() => setAssignPerson(null)}
        onAssigned={(row) => {
          setPeople((prev) => {
            const belongs =
              row.primaryTeam?.slug === teamSlug ||
              row.additionalTeams.some((t) => t.slug === teamSlug)
            if (!belongs) return prev.filter((p) => p.id !== row.id)
            if (prev.some((p) => p.id === row.id)) {
              return prev.map((p) => (p.id === row.id ? row : p))
            }
            return [...prev, row]
          })
        }}
      />
    </div>
  )
}

function TeamBoardGate() {
  const { teamSlug } = useParams()
  if (!isTeamBoardSlug(teamSlug)) {
    return <Navigate to="/leader" replace />
  }
  return (
    <RequireLeaderAccess>
      <TeamBoard teamSlug={teamSlug} />
    </RequireLeaderAccess>
  )
}

export function TeamBoardPage() {
  return <TeamBoardGate />
}
