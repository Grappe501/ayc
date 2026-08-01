import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  LoadingState,
  PageHeader,
  Section,
  StatCard,
  Tag,
} from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderRoster,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import './leader-board.css'

const SEGMENTS = {
  'high-school': {
    slug: 'high-school' as const,
    title: 'High School Lead Organizer Board',
    locationType: 'HIGH_SCHOOL',
    charge:
      'Develop lead organizers in every high school. This shell rolls up HS people and locations — full location TEAM boards ship in a later slice.',
  },
  'working-class': {
    slug: 'working-class' as const,
    title: 'Working Class Lead Organizer Board',
    locationType: 'COUNTY',
    charge:
      'Develop lead organizers across county / non-student communities. This shell rolls up working-class people and counties — full location boards ship later.',
  },
} as const

type SegmentSlug = keyof typeof SEGMENTS

function isSegmentSlug(value: string | undefined): value is SegmentSlug {
  return Boolean(value && value in SEGMENTS)
}

function SegmentBoard({ segment }: { segment: SegmentSlug }) {
  const meta = SEGMENTS[segment]
  const [people, setPeople] = useState<LeaderRosterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const roster = await fetchLeaderRoster({ status: 'ALL' })
      if (cancelled) return
      if (!roster.ok) {
        setError(roster.error.message)
        setLoading(false)
        return
      }
      setPeople(roster.data.people)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const scoped = useMemo(
    () =>
      people.filter((person) => person.location?.locationType === meta.locationType),
    [people, meta.locationType],
  )

  const locations = useMemo(() => {
    const map = new Map<
      string,
      { id: string; code: string; name: string; count: number }
    >()
    for (const person of scoped) {
      if (!person.location) continue
      const current = map.get(person.location.id)
      if (current) {
        current.count += 1
      } else {
        map.set(person.location.id, {
          id: person.location.id,
          code: person.location.code,
          name: person.location.name,
          count: 1,
        })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [scoped])

  const missingContact = scoped.filter((person) => person.missingContact).length
  const prospective = scoped.filter((person) => person.status === 'PROSPECTIVE').length
  const joinForm = scoped.filter(
    (person) => person.status === 'PROSPECTIVE' && person.source === 'JOIN_FORM',
  ).length

  return (
    <div className={`segment-board segment-board--${segment}`}>
      <PageHeader
        eyebrow="Segment Lead Board"
        title={meta.title}
        lede={meta.charge}
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Leader Board
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
        <StatCard value={loading ? '…' : String(scoped.length)} label="People in segment" />
        <StatCard value={loading ? '…' : String(locations.length)} label="Locations represented" />
        <StatCard value={loading ? '…' : String(missingContact)} label="Contact gaps" />
        <StatCard value={loading ? '…' : String(prospective)} label="Prospectives" />
      </div>

      <Section id="role" title="Your charge">
        <Card>
          <Tag>Segment lead</Tag>
          <p>
            Category Campaign Leads still own their functional boards at every location type. Your
            job is to grow <strong>location leadership</strong> — open each location TEAM board to
            see who is there and who can lead next.
          </p>
          <p className="field__hint">
            Full segment workspace (develop-local-leads queues) ships in Phase 2F. Location TEAM and
            category boards are live now.
          </p>
        </Card>
      </Section>

      <Section id="attention" title="Segment attention">
        {loading ? <LoadingState label="Loading segment snapshot…" /> : null}
        {!loading ? (
          <div className="leader-attention">
            <Card>
              <Tag>Gaps</Tag>
              <h3>{missingContact} missing phone & email</h3>
              <p>Clear contact gaps so HS / WC outreach can reach people.</p>
              <Button to="/leader/gaps" variant="primary">
                Gap fill
              </Button>
            </Card>
            {joinForm > 0 ? (
              <Card>
                <Tag>Join</Tag>
                <h3>{joinForm} join applications in this segment</h3>
                <p>Review prospectives tied to {meta.locationType === 'HIGH_SCHOOL' ? 'high schools' : 'counties'}.</p>
                <Button to="/leader" variant="secondary">
                  Open Leader Board
                </Button>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Section>

      <Section id="locations" title="Locations in this segment">
        {loading ? <LoadingState label="Loading locations…" /> : null}
        {!loading && locations.length === 0 ? (
          <p className="field__hint">
            No {meta.locationType === 'HIGH_SCHOOL' ? 'high school' : 'county'} locations on the
            roster yet. Add contacts with the right location type to grow this rollup.
          </p>
        ) : null}
        {!loading && locations.length > 0 ? (
          <div className="team-board-leads">
            {locations.map((location) => (
              <Card key={location.id}>
                <Tag>{location.code}</Tag>
                <h3>{location.name}</h3>
                <p>
                  {location.count} {location.count === 1 ? 'person' : 'people'} on roster
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
        {loading ? <LoadingState label="Loading people…" /> : null}
        {!loading && scoped.length === 0 ? (
          <p className="field__hint">No people with this location type yet.</p>
        ) : null}
        {!loading && scoped.length > 0 ? (
          <ul className="segment-people-list">
            {scoped.slice(0, 40).map((person) => (
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
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {!loading && scoped.length > 40 ? (
          <p className="field__hint">Showing first 40 of {scoped.length}. Use Leader Board search for the full list.</p>
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
