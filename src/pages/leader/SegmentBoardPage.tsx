import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
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
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import { pipelineTagLabel } from '@/features/leader/pipelineLabels'
import {
  fetchLeaderRoster,
  fetchLocations,
  type LeaderLocation,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import './leader-board.css'

const SEGMENTS = {
  'high-school': {
    slug: 'high-school' as const,
    title: 'High School Lead Organizer Board',
    locationType: 'HIGH_SCHOOL' as const,
    charge:
      'Develop lead organizers in every high school. Use the develop-local-leads queue, cover every school, and open location TEAM boards to grow people who can run them.',
  },
  'working-class': {
    slug: 'working-class' as const,
    title: 'Working Class Lead Organizer Board',
    locationType: 'COUNTY' as const,
    charge:
      'Develop lead organizers across county / non-student communities. Use the develop-local-leads queue, cover every county, and open location TEAM boards to grow local leadership.',
  },
} as const

type SegmentSlug = keyof typeof SEGMENTS

function isSegmentSlug(value: string | undefined): value is SegmentSlug {
  return Boolean(value && value in SEGMENTS)
}

function isDevelopLead(person: LeaderRosterRow): boolean {
  return (
    person.pipelineTags.includes('LOCAL_LEAD_CANDIDATE') ||
    person.pipelineTags.includes('READY_TO_LEAD')
  )
}

function SegmentBoard({ segment }: { segment: SegmentSlug }) {
  const meta = SEGMENTS[segment]
  const [people, setPeople] = useState<LeaderRosterRow[]>([])
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
  const [allLocations, setAllLocations] = useState<LeaderLocation[]>([])
  const [q, setQ] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [pipelineFilter, setPipelineFilter] = useState('ALL')
  const [gapsOnly, setGapsOnly] = useState(false)
  const [developOnly, setDevelopOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => setQ(searchDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const [roster, locations] = await Promise.all([
        fetchLeaderRoster({
          locationType: meta.locationType,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          q: q || undefined,
          gapsOnly,
          pipelineTag: pipelineFilter === 'ALL' ? undefined : pipelineFilter,
        }),
        fetchLocations(meta.locationType),
      ])
      if (cancelled) return
      if (locations.ok) setAllLocations(locations.data)
      if (!roster.ok) {
        setError(roster.error.message)
        setLoading(false)
        return
      }
      setPeople(roster.data.people)
      setAttention(roster.data.attention)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [meta.locationType, q, statusFilter, pipelineFilter, gapsOnly])

  const visiblePeople = useMemo(() => {
    if (!developOnly) return people
    return people.filter(isDevelopLead)
  }, [people, developOnly])

  const developQueue = useMemo(
    () =>
      people
        .filter(isDevelopLead)
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [people],
  )

  const peopleByLocation = useMemo(() => {
    const map = new Map<string, LeaderRosterRow[]>()
    for (const person of people) {
      if (!person.location) continue
      const list = map.get(person.location.id) ?? []
      list.push(person)
      map.set(person.location.id, list)
    }
    return map
  }, [people])

  const locationCoverage = useMemo(() => {
    return allLocations
      .map((location) => {
        const roster = peopleByLocation.get(location.id) ?? []
        const gaps = roster.filter((person) => person.missingContact).length
        const localLead = roster.filter((person) =>
          person.pipelineTags.includes('LOCAL_LEAD_CANDIDATE'),
        ).length
        const ready = roster.filter((person) =>
          person.pipelineTags.includes('READY_TO_LEAD'),
        ).length
        return {
          ...location,
          count: roster.length,
          gaps,
          localLead,
          ready,
          thin: roster.length === 0 || localLead + ready === 0,
        }
      })
      .sort((a, b) => {
        if (a.thin !== b.thin) return a.thin ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }, [allLocations, peopleByLocation])

  const thinLocations = locationCoverage.filter((location) => location.thin).length

  return (
    <div className={`segment-board segment-board--${segment}`}>
      <PageHeader
        eyebrow="Segment Lead Workspace"
        title={meta.title}
        lede={meta.charge}
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Leader Board
            </Button>
            <Button to={`/leader/calendar?board=${segment}`} variant="secondary">
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

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card-grid card-grid--3 section">
        <StatCard value={loading ? '…' : String(people.length)} label="People in segment" />
        <StatCard
          value={loading ? '…' : String(allLocations.length)}
          label="Locations in segment"
        />
        <StatCard value={loading ? '…' : String(thinLocations)} label="Need local-lead coverage" />
        <StatCard
          value={loading ? '…' : String(attention.localLeadCandidate + attention.readyToLead)}
          label="Develop-lead queue"
        />
      </div>

      <Section id="role" title="Your charge">
        <Card>
          <Tag>Develop location leadership</Tag>
          <p>
            Category Campaign Leads still own their functional boards at every location. Your job
            is to grow <strong>people who can run location TEAM boards</strong> — identify
            candidates, mentor them, and keep every school or county covered.
          </p>
        </Card>
      </Section>

      <Section id="attention" title="Segment attention">
        {loading ? <LoadingState label="Loading attention…" /> : null}
        {!loading ? (
          <div className="leader-attention">
            <Card>
              <Tag>Gaps</Tag>
              <h3>{attention.missingContact} missing phone & email</h3>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setGapsOnly(true)
                  setDevelopOnly(false)
                  setPipelineFilter('ALL')
                }}
              >
                Show gaps
              </Button>
            </Card>
            {attention.joinForm > 0 ? (
              <Card>
                <Tag>Join</Tag>
                <h3>{attention.joinForm} join applications</h3>
                <p>Prospectives from `/join` in this segment.</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setStatusFilter('PROSPECTIVE')
                    setGapsOnly(false)
                    setDevelopOnly(false)
                    setPipelineFilter('ALL')
                  }}
                >
                  Show prospectives
                </Button>
              </Card>
            ) : null}
            <Card>
              <Tag>Pipeline</Tag>
              <h3>{attention.localLeadCandidate} local lead candidates</h3>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setPipelineFilter('LOCAL_LEAD_CANDIDATE')
                  setDevelopOnly(false)
                  setGapsOnly(false)
                }}
              >
                Show local-lead tags
              </Button>
            </Card>
            <Card>
              <Tag>Pipeline</Tag>
              <h3>{attention.readyToLead} ready to lead</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPipelineFilter('READY_TO_LEAD')
                  setDevelopOnly(false)
                  setGapsOnly(false)
                }}
              >
                Show ready to lead
              </Button>
            </Card>
            {attention.needsMentoring > 0 ? (
              <Card>
                <Tag>Pipeline</Tag>
                <h3>{attention.needsMentoring} need mentoring</h3>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setPipelineFilter('NEEDS_MENTORING')
                    setDevelopOnly(false)
                    setGapsOnly(false)
                  }}
                >
                  Show mentoring
                </Button>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Section>

      <Section id="develop" title="Develop local leads">
        <p className="field__hint" style={{ marginBottom: '1rem' }}>
          Primary queue: local lead candidates and people marked ready to lead. Open the contact to
          adjust pipeline tags or grant a Location Lead role (master key). Open the location TEAM
          board to place them in context.
        </p>
        {loading ? <LoadingState label="Loading develop queue…" /> : null}
        {!loading && developQueue.length === 0 ? (
          <p className="field__hint">
            No develop-lead tags in this segment yet. Tag people on their contact record, or watch
            for Join applicants who chose local leadership interest.
          </p>
        ) : null}
        {!loading && developQueue.length > 0 ? (
          <ul className="segment-people-list">
            {developQueue.map((person) => (
              <li key={person.id}>
                <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                  {person.displayName}
                </Button>
                <span className="field__hint">
                  {person.location
                    ? `${person.location.code} · ${person.location.name}`
                    : 'No location'}
                  {' · '}
                  {person.pipelineTags.map((tag) => pipelineTagLabel(tag)).join(' · ')}
                </span>
                {person.location ? (
                  <Button to={`/leader/locations/${person.location.id}`} variant="primary">
                    Location board
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDevelopOnly(true)
              setGapsOnly(false)
              setPipelineFilter('ALL')
            }}
          >
            Filter people list to develop queue
          </Button>
        </div>
      </Section>

      <Section id="locations" title="Location coverage">
        <p className="field__hint" style={{ marginBottom: '1rem' }}>
          Every {meta.locationType === 'HIGH_SCHOOL' ? 'high school' : 'county'} on file — thin
          coverage (no people or no local-lead / ready-to-lead tag) sorts first.
        </p>
        {loading ? <LoadingState label="Loading locations…" /> : null}
        {!loading && locationCoverage.length === 0 ? (
          <p className="field__hint">
            No {meta.locationType === 'HIGH_SCHOOL' ? 'high school' : 'county'} locations yet. Add
            contacts with the right location type to grow coverage.
          </p>
        ) : null}
        {!loading && locationCoverage.length > 0 ? (
          <div className="team-board-leads">
            {locationCoverage.map((location) => (
              <Card key={location.id}>
                <Tag>{location.code}</Tag>
                {location.thin ? <Tag>Needs coverage</Tag> : <Tag>Covered</Tag>}
                <h3>{location.name}</h3>
                <p>
                  {location.count} {location.count === 1 ? 'person' : 'people'}
                  {location.gaps > 0 ? ` · ${location.gaps} contact gaps` : ''}
                </p>
                <p className="field__hint">
                  Local-lead candidates: {location.localLead} · Ready to lead: {location.ready}
                </p>
                <Button to={`/leader/locations/${location.id}`} variant="primary">
                  Open location board
                </Button>
              </Card>
            ))}
          </div>
        ) : null}
      </Section>

      <Section id="people" title="People in this segment">
        <div className="leader-board-filters">
          <Field id="seg-q" label="Search">
            <Input
              id="seg-q"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, school, or code"
            />
          </Field>
          <Field id="seg-status" label="Status">
            <Select
              id="seg-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All non-archived</option>
              <option value="ACTIVE">Active</option>
              <option value="PROSPECTIVE">Prospective</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>
          <Field id="seg-pipeline" label="Pipeline tag">
            <Select
              id="seg-pipeline"
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
            >
              <option value="ALL">Any</option>
              <option value="LOCAL_LEAD_CANDIDATE">Local lead candidate</option>
              <option value="READY_TO_LEAD">Ready to lead</option>
              <option value="NEEDS_MENTORING">Needs mentoring</option>
              <option value="FUTURE_LEADER">Future leader</option>
              <option value="CATEGORY_LEAD_CANDIDATE">Category lead candidate</option>
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
              checked={developOnly}
              onChange={(e) => setDevelopOnly(e.target.checked)}
            />
            Develop queue only
          </label>
        </div>
        <p className="field__hint" aria-live="polite">
          {loading
            ? 'Loading…'
            : `${visiblePeople.length} ${visiblePeople.length === 1 ? 'person' : 'people'}`}
        </p>
        {loading ? <LoadingState label="Loading people…" /> : null}
        {!loading && visiblePeople.length === 0 ? (
          <p className="field__hint">No people match these filters.</p>
        ) : null}
        {!loading && visiblePeople.length > 0 ? (
          <ul className="segment-people-list">
            {visiblePeople.map((person) => (
              <li key={person.id}>
                <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                  {person.displayName}
                </Button>
                <span className="field__hint">
                  {person.location
                    ? `${person.location.code} · ${person.location.name}`
                    : 'No location'}
                  {person.primaryTeam ? ` · ${person.primaryTeam.name}` : ''}
                  {person.missingContact ? ' · Needs contact' : ''}
                  {person.pipelineTags.length > 0
                    ? ` · ${person.pipelineTags.map((tag) => pipelineTagLabel(tag)).join(', ')}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>
    </div>
  )
}

function SegmentBoardGate() {
  const { segmentSlug } = useParams()
  if (!isSegmentSlug(segmentSlug)) {
    return <Navigate to="/leader" replace />
  }
  return (
    <RequireLeaderAccess segment={segmentSlug}>
      <SegmentBoard segment={segmentSlug} />
    </RequireLeaderAccess>
  )
}

export function SegmentBoardPage() {
  return <SegmentBoardGate />
}
