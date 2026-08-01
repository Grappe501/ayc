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
import { BoardCalendarPanel } from '@/features/calendar/BoardCalendarPanel'
import { AssignTeamDialog } from '@/features/leader/AssignTeamDialog'
import { LeaderRosterList } from '@/features/leader/LeaderRosterList'
import { LocationTeamMissionPanel } from '@/features/leader/LocationTeamMissionPanel'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderRoster,
  fetchLocation,
  fetchTeams,
  type LeaderLocation,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import {
  isLocationCategorySlug,
  LOCATION_CATEGORY_TEAMS,
  locationCategoryPath,
  locationTeamPath,
  type LocationCategorySlug,
} from '@/content/locationCategories'
import { summarizeTeamRoster } from '@/features/leader/teamBoards'
import { teamBoardPath } from '@/features/leader/accessScope'
import './leader-board.css'

function locationTypeLabel(type: string): string {
  if (type === 'HIGH_SCHOOL') return 'High School'
  if (type === 'COUNTY') return 'Working Class / County'
  if (type === 'COLLEGE') return 'College'
  return type
}

function segmentBackPath(locationType: string): string | null {
  if (locationType === 'HIGH_SCHOOL') return '/leader/segments/high-school'
  if (locationType === 'COUNTY') return '/leader/segments/working-class'
  return null
}

function useLocationRoster(locationId: string, teamSlug?: LocationCategorySlug) {
  const [location, setLocation] = useState<LeaderLocation | null>(null)
  const [people, setPeople] = useState<LeaderRosterRow[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [gapsOnly, setGapsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assignPerson, setAssignPerson] = useState<LeaderRosterRow | null>(null)
  const [defaultTeamId, setDefaultTeamId] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => setQ(searchDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const [locResult, roster, teamResult] = await Promise.all([
        fetchLocation(locationId),
        fetchLeaderRoster({
          locationId,
          team: teamSlug,
          q: q || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          gapsOnly,
        }),
        fetchTeams(),
      ])
      if (cancelled) return
      if (!locResult.ok) {
        setError(locResult.error.message)
        setLocation(null)
        setLoading(false)
        return
      }
      setLocation(locResult.data)
      if (teamResult.ok && teamSlug) {
        setDefaultTeamId(teamResult.data.find((team) => team.slug === teamSlug)?.id ?? '')
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
  }, [locationId, teamSlug, q, statusFilter, gapsOnly])

  return {
    location,
    people,
    setPeople,
    total,
    setTotal,
    searchDraft,
    setSearchDraft,
    statusFilter,
    setStatusFilter,
    gapsOnly,
    setGapsOnly,
    loading,
    error,
    assignPerson,
    setAssignPerson,
    defaultTeamId,
  }
}

function LocationFilters(props: {
  searchDraft: string
  setSearchDraft: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  gapsOnly: boolean
  setGapsOnly: (value: boolean) => void
  total: number
  loading: boolean
}) {
  return (
    <>
      <div className="leader-board-filters">
        <Field id="loc-roster-q" label="Search">
          <Input
            id="loc-roster-q"
            value={props.searchDraft}
            onChange={(e) => props.setSearchDraft(e.target.value)}
            placeholder="Name or team"
          />
        </Field>
        <Field id="loc-roster-status" label="Status">
          <Select
            id="loc-roster-status"
            value={props.statusFilter}
            onChange={(e) => props.setStatusFilter(e.target.value)}
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
            checked={props.gapsOnly}
            onChange={(e) => props.setGapsOnly(e.target.checked)}
          />
          Gaps only
        </label>
      </div>
      <p className="field__hint" aria-live="polite">
        {props.loading ? 'Loading…' : `${props.total} ${props.total === 1 ? 'person' : 'people'}`}
      </p>
    </>
  )
}

function LocationTeamBoard({ locationId }: { locationId: string }) {
  const state = useLocationRoster(locationId)
  const segmentPath = state.location ? segmentBackPath(state.location.locationType) : null

  const stats = useMemo(() => {
    const teams = new Set(
      state.people
        .flatMap((person) => [
          person.primaryTeam?.slug,
          ...person.additionalTeams.map((team) => team.slug),
        ])
        .filter(Boolean),
    )
    return {
      missingContact: state.people.filter((person) => person.missingContact).length,
      prospective: state.people.filter((person) => person.status === 'PROSPECTIVE').length,
      teamsRepresented: teams.size,
    }
  }, [state.people])

  if (!state.loading && (state.error || !state.location)) {
    return (
      <div>
        <PageHeader title="Location not found" lede={state.error || 'This location could not be loaded.'} />
        <Button to="/leader" variant="secondary">
          Return to Leader Board
        </Button>
      </div>
    )
  }

  if (!state.location) {
    return <LoadingState label="Loading location…" />
  }

  const location = state.location

  return (
    <div className="location-board location-board--team">
      <PageHeader
        eyebrow="Location TEAM Board"
        title={`${location.name} Team Board`}
        lede={`All members at this ${locationTypeLabel(location.locationType).toLowerCase()} location (${location.compositeCode}).`}
        actions={
          <>
            <Tag>{locationTypeLabel(location.locationType)}</Tag>
            {segmentPath ? (
              <Button to={segmentPath} variant="secondary">
                Segment board
              </Button>
            ) : (
              <Button to="/leader" variant="secondary">
                Leader Board
              </Button>
            )}
            <Button to={`#mission`} variant="secondary">
              Mission
            </Button>
            <Button
              to={`/leader/calendar?locationId=${location.id}`}
              variant="secondary"
            >
              Calendar
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

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(state.total)} label="People here" />
        <StatCard value={String(stats.teamsRepresented)} label="Teams represented" />
        <StatCard value={String(stats.missingContact)} label="Contact gaps" />
        <StatCard value={String(stats.prospective)} label="Prospectives" />
      </div>

      <LocationTeamMissionPanel
        locationType={location.locationType}
        locationName={location.name}
        stats={{
          missingContact: stats.missingContact,
          prospective: stats.prospective,
          teamsRepresented: stats.teamsRepresented,
          total: state.total,
        }}
      />

      <BoardCalendarPanel
        locationId={location.id}
        title={`${location.name} calendar`}
      />

      <Section id="category-boards" title="Category boards at this location">
        <div className="team-board-hub">
          {LOCATION_CATEGORY_TEAMS.map((team) => (
            <Card key={team.id}>
              <span className="team-board-hub__mark">{team.mark}</span>
              <h3>{team.name}</h3>
              <p>{team.shortLabel}</p>
              <Button to={locationCategoryPath(location.id, team.id)} variant="primary">
                Open board
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="roster" title="Everyone at this location">
        <LocationFilters
          searchDraft={state.searchDraft}
          setSearchDraft={state.setSearchDraft}
          statusFilter={state.statusFilter}
          setStatusFilter={state.setStatusFilter}
          gapsOnly={state.gapsOnly}
          setGapsOnly={state.setGapsOnly}
          total={state.total}
          loading={state.loading}
        />
        {state.loading ? <LoadingState label="Loading roster…" /> : null}
        {!state.loading ? (
          <LeaderRosterList
            people={state.people}
            emptyTitle="No one at this location yet."
            emptyDescription="Add a contact with this location, or assign someone from the statewide roster."
            emptyBadge={location.name}
            onAssign={state.setAssignPerson}
          />
        ) : null}
      </Section>

      <AssignTeamDialog
        open={Boolean(state.assignPerson)}
        person={state.assignPerson}
        onClose={() => state.setAssignPerson(null)}
        onAssigned={(row) => {
          state.setAssignPerson(null)
          if (row.location?.id !== location.id) {
            state.setPeople((prev) => prev.filter((person) => person.id !== row.id))
            state.setTotal((prev) => Math.max(0, prev - 1))
            return
          }
          state.setPeople((prev) =>
            prev.some((person) => person.id === row.id)
              ? prev.map((person) => (person.id === row.id ? row : person))
              : [...prev, row],
          )
        }}
      />
    </div>
  )
}

function LocationCategoryBoard({
  locationId,
  teamSlug,
}: {
  locationId: string
  teamSlug: LocationCategorySlug
}) {
  const state = useLocationRoster(locationId, teamSlug)
  const teamMeta = LOCATION_CATEGORY_TEAMS.find((team) => team.id === teamSlug)!
  const summary = useMemo(
    () => summarizeTeamRoster(state.people, teamSlug),
    [state.people, teamSlug],
  )

  if (!state.loading && (state.error || !state.location)) {
    return (
      <div>
        <PageHeader title="Location not found" lede={state.error || 'This location could not be loaded.'} />
        <Button to="/leader" variant="secondary">
          Return to Leader Board
        </Button>
      </div>
    )
  }

  if (!state.location) {
    return <LoadingState label="Loading location…" />
  }

  const location = state.location

  return (
    <div className={`location-board location-board--${teamSlug}`}>
      <PageHeader
        eyebrow="Location Category Board"
        title={`${location.name} · ${teamMeta.name}`}
        lede={`${teamMeta.shortLabel} at ${location.compositeCode}.`}
        actions={
          <>
            <Button to={locationTeamPath(location.id)} variant="secondary">
              Location TEAM
            </Button>
            <Button to={teamBoardPath(teamSlug)} variant="secondary">
              Statewide {teamMeta.name}
            </Button>
            <Button
              to={`/leader/calendar?locationId=${location.id}&teamSlug=${teamSlug}`}
              variant="secondary"
            >
              Calendar
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

      <nav className="team-board-switcher" aria-label="Location category boards">
        {LOCATION_CATEGORY_TEAMS.map((team) => (
          <Link
            key={team.id}
            to={locationCategoryPath(location.id, team.id)}
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

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(summary.roster)} label="On this team here" />
        <StatCard value={String(summary.leads)} label="Leads" />
        <StatCard value={String(summary.volunteers)} label="Volunteers" />
        <StatCard value={String(summary.missingContact)} label="Contact gaps" />
      </div>

      <BoardCalendarPanel
        locationId={location.id}
        teamSlug={teamSlug}
        title={`${location.name} · ${teamMeta.name} calendar`}
      />

      <Section id="roster" title={`${teamMeta.name} at ${location.name}`}>
        <LocationFilters
          searchDraft={state.searchDraft}
          setSearchDraft={state.setSearchDraft}
          statusFilter={state.statusFilter}
          setStatusFilter={state.setStatusFilter}
          gapsOnly={state.gapsOnly}
          setGapsOnly={state.setGapsOnly}
          total={state.total}
          loading={state.loading}
        />
        {state.loading ? <LoadingState label="Loading roster…" /> : null}
        {!state.loading ? (
          <LeaderRosterList
            people={state.people}
            focusTeamSlug={teamSlug}
            emptyTitle={`No ${teamMeta.name} members at this location yet.`}
            emptyDescription="Assign someone to this team, or add a new contact here."
            emptyBadge={`${location.name} · ${teamMeta.name}`}
            onAssign={state.setAssignPerson}
          />
        ) : null}
      </Section>

      <AssignTeamDialog
        open={Boolean(state.assignPerson)}
        person={state.assignPerson}
        defaultTeamId={state.defaultTeamId || undefined}
        onClose={() => state.setAssignPerson(null)}
        onAssigned={(row) => {
          state.setAssignPerson(null)
          const onTeam =
            row.primaryTeam?.slug === teamSlug ||
            row.additionalTeams.some((team) => team.slug === teamSlug)
          if (!onTeam || row.location?.id !== location.id) {
            state.setPeople((prev) => prev.filter((person) => person.id !== row.id))
            state.setTotal((prev) => Math.max(0, prev - 1))
            return
          }
          state.setPeople((prev) =>
            prev.some((person) => person.id === row.id)
              ? prev.map((person) => (person.id === row.id ? row : person))
              : [...prev, row],
          )
        }}
      />
    </div>
  )
}

function LocationTeamGate() {
  const { locationId = '' } = useParams()
  const [locationType, setLocationType] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await fetchLocation(locationId)
      if (cancelled) return
      if (!result.ok) {
        setMissing(true)
        return
      }
      setLocationType(result.data.locationType)
    })()
    return () => {
      cancelled = true
    }
  }, [locationId])

  if (missing) {
    return (
      <div>
        <PageHeader title="Location not found" lede="This location could not be loaded." />
        <Button to="/leader" variant="secondary">
          Return to Leader Board
        </Button>
      </div>
    )
  }

  if (!locationType) {
    return <LoadingState label="Checking access…" />
  }

  return (
    <RequireLeaderAccess locationType={locationType} locationId={locationId}>
      <LocationTeamBoard locationId={locationId} />
    </RequireLeaderAccess>
  )
}

function LocationCategoryGate() {
  const { locationId = '', teamSlug } = useParams()
  const [locationType, setLocationType] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await fetchLocation(locationId)
      if (cancelled) return
      if (!result.ok) {
        setMissing(true)
        return
      }
      setLocationType(result.data.locationType)
    })()
    return () => {
      cancelled = true
    }
  }, [locationId])

  if (!isLocationCategorySlug(teamSlug)) {
    return <Navigate to={locationTeamPath(locationId)} replace />
  }

  if (missing) {
    return (
      <div>
        <PageHeader title="Location not found" lede="This location could not be loaded." />
        <Button to="/leader" variant="secondary">
          Return to Leader Board
        </Button>
      </div>
    )
  }

  if (!locationType) {
    return <LoadingState label="Checking access…" />
  }

  return (
    <RequireLeaderAccess
      locationType={locationType}
      locationId={locationId}
      locationCategorySlug={teamSlug}
    >
      <LocationCategoryBoard locationId={locationId} teamSlug={teamSlug} />
    </RequireLeaderAccess>
  )
}

export function LocationTeamBoardPage() {
  return <LocationTeamGate />
}

export function LocationCategoryBoardPage() {
  return <LocationCategoryGate />
}
