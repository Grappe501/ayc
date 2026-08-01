import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Select,
  StatCard,
  Tag,
} from '@/components/ui'
import { Drawer } from '@/components/ui/Overlay'
import {
  fetchDirectoryLocations,
  fetchDirectoryOptions,
  fetchDirectoryPeople,
  fetchDirectorySummary,
  fetchDirectoryTeams,
  type DirectoryLocation,
  type DirectoryPerson,
  type DirectorySummary,
  type DirectoryTeam,
} from '@/features/directory/directoryApi'
import { useDirectorySearchParams } from '@/features/directory/useDirectorySearchParams'
import { hasLeaderSession } from '@/features/leader/leaderSession'
import './directory.css'

function labelStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function labelType(type: string) {
  if (type === 'HIGH_SCHOOL') return 'High School'
  if (type === 'COLLEGE') return 'College'
  if (type === 'COUNTY') return 'County'
  return type
}

export function DirectoryPage() {
  const {
    view,
    q,
    locationType,
    location,
    team,
    position,
    status,
    sort,
    setView,
    update,
    clearFilters,
    activeFilterCount,
    peopleQuery,
  } = useDirectorySearchParams()

  const [summary, setSummary] = useState<DirectorySummary | null>(null)
  const [people, setPeople] = useState<DirectoryPerson[]>([])
  const [total, setTotal] = useState(0)
  const [teams, setTeams] = useState<DirectoryTeam[]>([])
  const [locations, setLocations] = useState<DirectoryLocation[]>([])
  const [options, setOptions] = useState<{
    locations: Array<{ id: string; name: string; code: string; locationType: string }>
    teams: Array<{ id: string; name: string; slug: string }>
  }>({ locations: [], teams: [] })
  const [searchDraft, setSearchDraft] = useState(q)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const leader = hasLeaderSession()

  useEffect(() => {
    setSearchDraft(q)
  }, [q])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchDraft !== q) update({ q: searchDraft.trim() || null })
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchDraft, q, update])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const summaryResult = await fetchDirectorySummary()
      const optionsResult = await fetchDirectoryOptions()
      if (cancelled) return
      if (summaryResult.ok) setSummary(summaryResult.data)
      if (optionsResult.ok) {
        setOptions({
          locations: optionsResult.data.locations,
          teams: optionsResult.data.teams,
        })
      }

      if (view === 'teams') {
        const result = await fetchDirectoryTeams()
        if (cancelled) return
        if (!result.ok) setError(result.error.message)
        else setTeams(result.data.teams)
      } else if (view === 'locations') {
        const result = await fetchDirectoryLocations()
        if (cancelled) return
        if (!result.ok) setError(result.error.message)
        else setLocations(result.data.locations)
      } else {
        const result = await fetchDirectoryPeople(peopleQuery)
        if (cancelled) return
        if (!result.ok) setError(result.error.message)
        else {
          setPeople(result.data.people)
          setTotal(result.data.total)
        }
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [view, peopleQuery])

  const chips = useMemo(() => {
    const items: Array<{ key: string; label: string; clear: Record<string, null> }> = []
    if (q) items.push({ key: 'q', label: `Search: ${q}`, clear: { q: null } })
    if (locationType) {
      items.push({
        key: 'locationType',
        label: `Type: ${labelType(locationType)}`,
        clear: { locationType: null },
      })
    }
    if (location) {
      const loc = options.locations.find((l) => l.id === location)
      items.push({
        key: 'location',
        label: `Location: ${loc ? `${loc.code} · ${loc.name}` : location}`,
        clear: { location: null },
      })
    }
    if (team) {
      const t = options.teams.find((item) => item.slug === team)
      items.push({
        key: 'team',
        label: `Team: ${t?.name ?? team}`,
        clear: { team: null },
      })
    }
    if (position) {
      items.push({
        key: 'position',
        label: `Position: ${position === 'LEAD' ? 'Lead' : 'Volunteer'}`,
        clear: { position: null },
      })
    }
    if (status && status !== 'ACTIVE') {
      items.push({
        key: 'status',
        label: `Status: ${labelStatus(status)}`,
        clear: { status: null },
      })
    }
    return items
  }, [q, locationType, location, team, position, status, options])

  const locationOptions = options.locations.filter(
    (loc) => !locationType || loc.locationType === locationType,
  )

  const filterFields = (
    <div className="directory-filters directory-filters-panel">
      <Field id="filter-type" label="Location type">
        <Select
          id="filter-type"
          value={locationType}
          onChange={(e) =>
            update({
              locationType: e.target.value || null,
              location: null,
            })
          }
        >
          <option value="">All types</option>
          <option value="COLLEGE">College</option>
          <option value="HIGH_SCHOOL">High School</option>
          <option value="COUNTY">County</option>
        </Select>
      </Field>
      <Field id="filter-location" label="Location">
        <Select
          id="filter-location"
          value={location}
          onChange={(e) => update({ location: e.target.value || null })}
        >
          <option value="">All locations</option>
          {locationOptions.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.code} · {loc.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="filter-team" label="Team">
        <Select
          id="filter-team"
          value={team}
          onChange={(e) => update({ team: e.target.value || null })}
        >
          <option value="">All teams</option>
          {options.teams.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="filter-position" label="Position">
        <Select
          id="filter-position"
          value={position}
          onChange={(e) => update({ position: e.target.value || null })}
        >
          <option value="">All positions</option>
          <option value="LEAD">Lead</option>
          <option value="VOLUNTEER">Volunteer</option>
        </Select>
      </Field>
      <Field id="filter-status" label="Status">
        <Select
          id="filter-status"
          value={status}
          onChange={(e) => update({ status: e.target.value || 'ACTIVE' })}
        >
          <option value="ACTIVE">Active</option>
          <option value="PROSPECTIVE">Prospective</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
          <option value="ALL">All</option>
        </Select>
      </Field>
      <Field id="filter-sort" label="Sort">
        <Select
          id="filter-sort"
          value={sort}
          onChange={(e) => update({ sort: e.target.value || 'name' })}
        >
          <option value="name">Name</option>
          <option value="location">Location</option>
          <option value="team">Team</option>
          <option value="recent">Recently added</option>
        </Select>
      </Field>
    </div>
  )

  return (
    <div>
      <PageHeader
        eyebrow="Leadership Directory"
        title="Leadership Directory"
        lede="Find the people and places building the Arkansas Youth Coalition."
      />

      <div className="directory-metrics">
        <StatCard value={String(summary?.activePeople ?? '—')} label="Active People" />
        <StatCard value={String(summary?.leads ?? '—')} label="Leads" />
        <StatCard value={String(summary?.volunteers ?? '—')} label="Volunteers" />
        <StatCard value={String(summary?.locations ?? '—')} label="Locations" />
      </div>

      <div className="directory-tabs" role="navigation" aria-label="Directory views">
        <Button
          type="button"
          variant={view === 'people' ? 'primary' : 'secondary'}
          aria-current={view === 'people' ? 'page' : undefined}
          onClick={() => setView('people')}
        >
          People
        </Button>
        <Button
          type="button"
          variant={view === 'teams' ? 'primary' : 'secondary'}
          aria-current={view === 'teams' ? 'page' : undefined}
          onClick={() => setView('teams')}
        >
          Teams
        </Button>
        <Button
          type="button"
          variant={view === 'locations' ? 'primary' : 'secondary'}
          aria-current={view === 'locations' ? 'page' : undefined}
          onClick={() => setView('locations')}
        >
          Locations
        </Button>
      </div>

      {view === 'people' ? (
        <>
          <div className="directory-search field">
            <label htmlFor="directory-q">Search</label>
            <Input
              id="directory-q"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search by name, school, college, county, code, or team"
            />
          </div>

          <div className="directory-filter-toggle">
            <Button type="button" variant="secondary" onClick={() => setFiltersOpen(true)}>
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>

          <div className="directory-filters-desktop">{filterFields}</div>
          {/* mobile filters open via drawer */}

          <Drawer open={filtersOpen} title="Filters" onClose={() => setFiltersOpen(false)}>
            {filterFields}
            <div className="btn-row" style={{ marginTop: '1rem' }}>
              <Button type="button" variant="primary" onClick={() => setFiltersOpen(false)}>
                Apply
              </Button>
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          </Drawer>

          {chips.length > 0 ? (
            <div className="directory-chips">
              {chips.map((chip) => (
                <span key={chip.key} className="directory-chip">
                  {chip.label}
                  <button type="button" onClick={() => update(chip.clear)} aria-label={`Remove ${chip.label}`}>
                    ×
                  </button>
                </span>
              ))}
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          ) : null}

          <p className="directory-count" aria-live="polite">
            {loading ? 'Loading…' : `${total} ${total === 1 ? 'person' : 'people'}`}
          </p>
        </>
      ) : null}

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading directory…" /> : null}

      {!loading && view === 'people' ? (
        people.length === 0 ? (
          <EmptyState
            icon="?"
            title="No people match these filters."
            description="Try removing a filter or searching for a different name, team, or location."
          >
            <div className="btn-row">
              <Button type="button" variant="primary" onClick={clearFilters}>
                Clear Filters
              </Button>
              {leader ? (
                <Button to="/leader/contacts/new" variant="secondary">
                  Add Contact
                </Button>
              ) : null}
            </div>
          </EmptyState>
        ) : (
          <>
            <div className="directory-desktop-table directory-table-wrap">
              <table className="directory-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Primary Team</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <Link to={`/directory/${person.id}`}>{person.displayName}</Link>
                      </td>
                      <td>
                        {person.location
                          ? `${person.location.code} · ${person.location.name}`
                          : '—'}
                      </td>
                      <td>{person.primaryTeam?.name ?? '—'}</td>
                      <td>
                        {person.position === 'LEAD'
                          ? 'Lead'
                          : person.position === 'VOLUNTEER'
                            ? 'Volunteer'
                            : '—'}
                      </td>
                      <td>{labelStatus(person.status)}</td>
                      <td>
                        <div>{person.email ?? '—'}</div>
                        <div>{person.phone ?? '—'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="directory-mobile-list">
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
                    {person.primaryTeam?.name ?? 'No team'}
                    {person.position
                      ? ` · ${person.position === 'LEAD' ? 'Lead' : 'Volunteer'}`
                      : ''}
                  </p>
                  <div className="btn-row">
                    <Button to={`/directory/${person.id}`} variant="secondary">
                      View Contact
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )
      ) : null}

      {!loading && view === 'teams' ? (
        <div className="card-grid card-grid--2">
          {teams.map((item) => (
            <Card key={item.slug} interactive>
              <button
                type="button"
                className="card--interactive"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'block',
                  width: '100%',
                }}
                onClick={() => {
                  update({
                    team: item.slug,
                    status: 'ACTIVE',
                    location: null,
                    locationType: null,
                    position: null,
                    q: null,
                  })
                  setView('people')
                }}
              >
                <Tag>{item.code}</Tag>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.activePeople === 0 ? (
                  <p className="field__hint">No active people are assigned to this team yet.</p>
                ) : (
                  <p>
                    {item.activePeople} active people
                    <br />
                    {item.leads} leads · {item.volunteers} volunteers
                    <br />
                    {item.locationsRepresented} locations represented
                  </p>
                )}
              </button>
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && view === 'locations' ? (
        <LocationsGrouped
          locations={locations}
          locationTypeFilter={locationType}
          leaderUnlocked={hasLeaderSession()}
          onSelect={(id) => {
            update({
              location: id,
              status: 'ACTIVE',
              team: null,
              position: null,
              q: null,
            })
            setView('people')
          }}
        />
      ) : null}
    </div>
  )
}

function LocationsGrouped({
  locations,
  onSelect,
  leaderUnlocked,
  locationTypeFilter,
}: {
  locations: DirectoryLocation[]
  onSelect: (id: string) => void
  leaderUnlocked: boolean
  locationTypeFilter: string
}) {
  const groups: Array<{ type: string; title: string; empty: string }> = [
    { type: 'COLLEGE', title: 'Colleges', empty: 'No colleges are represented yet.' },
    {
      type: 'HIGH_SCHOOL',
      title: 'High Schools',
      empty: 'No high schools are represented yet.\nLocations will appear as leaders and volunteers are added.',
    },
    { type: 'COUNTY', title: 'Counties', empty: 'No counties are represented yet.' },
  ].filter((group) => !locationTypeFilter || group.type === locationTypeFilter)

  return (
    <div className="card-grid">
      {groups.map((group) => {
        const items = locations.filter((loc) => loc.locationType === group.type)
        return (
          <section key={group.type}>
            <h2>{group.title}</h2>
            {items.length === 0 ? (
              <p className="field__hint">{group.empty}</p>
            ) : (
              <div className="card-grid card-grid--2">
                {items.map((loc) => (
                  <Card key={loc.id}>
                    <Tag>{loc.code}</Tag>
                    <h3>{loc.name}</h3>
                    <p>{labelType(loc.locationType)}</p>
                    <p>
                      {loc.activePeople} active people
                      <br />
                      {loc.leads} leads
                      <br />
                      {loc.teamsRepresented} teams represented
                    </p>
                    <div className="btn-row" style={{ marginTop: '0.75rem' }}>
                      <Button type="button" variant="secondary" onClick={() => onSelect(loc.id)}>
                        View people
                      </Button>
                      {leaderUnlocked ? (
                        <Button to={`/leader/locations/${loc.id}`} variant="primary">
                          Open TEAM board
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
