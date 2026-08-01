import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  Tag,
} from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import {
  fetchCalendarEvents,
  fetchEventRsvps,
  fetchLeaderRoster,
  inviteEventRsvps,
  removeEventRsvp,
  setEventRsvp,
  updateCalendarEvent,
  type CalendarEventItem,
  type CalendarRsvpCounts,
  type CalendarRsvpItem,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import '../leader/leader-board.css'
import '../leader/calendar.css'

function formatRsvpCounts(counts: CalendarRsvpCounts) {
  if (counts.total === 0) return 'No RSVPs'
  return `${counts.yes} yes · ${counts.maybe} maybe · ${counts.no} no · ${counts.invited} invited`
}

function formatWhen(event: CalendarEventItem) {
  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
  if (event.allDay) {
    return start.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
  return `${start.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} – ${end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
}

function EventDetail() {
  const { eventId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const occurrence = params.get('occurrence')
  const boardSlug = params.get('board') ?? undefined
  const locationId = params.get('locationId') ?? undefined
  const teamSlug = params.get('teamSlug') ?? undefined

  const [event, setEvent] = useState<CalendarEventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [rsvps, setRsvps] = useState<CalendarRsvpItem[]>([])
  const [rsvpCounts, setRsvpCounts] = useState<CalendarRsvpCounts | null>(null)
  const [inviteQ, setInviteQ] = useState('')
  const [inviteResults, setInviteResults] = useState<LeaderRosterRow[]>([])

  const backQs = new URLSearchParams()
  if (boardSlug) backQs.set('board', boardSlug)
  if (locationId) backQs.set('locationId', locationId)
  if (teamSlug) backQs.set('teamSlug', teamSlug)
  const backHref = `/leader/calendar${backQs.toString() ? `?${backQs}` : ''}`

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const from = new Date()
      from.setMonth(from.getMonth() - 2)
      const to = new Date()
      to.setMonth(to.getMonth() + 8)
      const result = await fetchCalendarEvents({
        boardSlug: locationId ? undefined : boardSlug ?? 'main',
        locationId,
        teamSlug,
        mode: 'rollup',
        from: from.toISOString(),
        to: to.toISOString(),
        includeCancelled: true,
      })
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setEvent(null)
        setLoading(false)
        return
      }
      const matches = result.data.events.filter((item) => item.id === eventId)
      const found =
        (occurrence
          ? matches.find((item) => item.occurrenceStartsAt === occurrence)
          : null) ??
        matches[0] ??
        null
      setEvent(found)
      setError(found ? '' : 'Event not found in this calendar window.')
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [eventId, occurrence, boardSlug, locationId, teamSlug])

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    ;(async () => {
      const result = await fetchEventRsvps(eventId)
      if (cancelled) return
      if (!result.ok) return
      setRsvps(result.data.rsvps)
      setRsvpCounts(result.data.counts)
    })()
    return () => {
      cancelled = true
    }
  }, [eventId])

  useEffect(() => {
    const q = inviteQ.trim()
    if (!q || q.length < 2) {
      setInviteResults([])
      return
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        const result = await fetchLeaderRoster({ q })
        if (!result.ok) return
        const already = new Set(rsvps.map((row) => row.personId))
        setInviteResults(
          result.data.people.filter((person) => !already.has(person.id)).slice(0, 8),
        )
      })()
    }, 300)
    return () => window.clearTimeout(handle)
  }, [inviteQ, rsvps])

  if (loading) return <LoadingState label="Loading event…" />

  if (!event) {
    return (
      <div>
        <PageHeader title="Event not found" lede={error || 'This event could not be loaded.'} />
        <Button to={backHref} variant="secondary">
          Back to calendar
        </Button>
      </div>
    )
  }

  return (
    <div className="calendar-page">
      <PageHeader
        eyebrow="Event detail"
        title={event.title}
        lede={formatWhen(event)}
        actions={
          <>
            <Button to={backHref} variant="secondary">
              Back to calendar
            </Button>
            <Button to={`/directory`} variant="secondary">
              Directory
            </Button>
          </>
        }
      />

      {toast ? (
        <div className="success-state" role="status">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      <Section title="Details">
        <Card>
          <p>
            <Tag>{event.visibility === 'PUBLIC' ? 'Public' : 'Internal'}</Tag>{' '}
            <Tag>{event.status}</Tag>{' '}
            {event.recurrenceLabel ? <Tag>{event.recurrenceLabel}</Tag> : null}
          </p>
          <p>
            <strong>Board:</strong> {event.sourceBoard.name} · {event.calendarName}
          </p>
          {event.locationText ? (
            <p>
              <strong>Place:</strong> {event.locationText}
            </p>
          ) : null}
          {event.url ? (
            <p>
              <strong>Link:</strong>{' '}
              <a href={event.url} target="_blank" rel="noreferrer">
                {event.url}
              </a>
            </p>
          ) : null}
          {event.description ? <p>{event.description}</p> : null}
          {rsvpCounts ? (
            <p className="field__hint">{formatRsvpCounts(rsvpCounts)}</p>
          ) : null}
          <div className="btn-row">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                void (async () => {
                  setBusy(true)
                  const result = await updateCalendarEvent({
                    id: event.id,
                    visibility: event.visibility === 'PUBLIC' ? 'INTERNAL' : 'PUBLIC',
                  })
                  setBusy(false)
                  if (!result.ok) {
                    setError(result.error.message)
                    return
                  }
                  setToast(
                    event.visibility === 'PUBLIC'
                      ? 'Event is now internal.'
                      : 'Event is now public.',
                  )
                  setEvent({
                    ...event,
                    visibility:
                      event.visibility === 'PUBLIC' ? 'INTERNAL' : 'PUBLIC',
                  })
                })()
              }}
            >
              {event.visibility === 'PUBLIC' ? 'Make internal' : 'Make public'}
            </Button>
            {event.isRecurring ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy || event.status === 'CANCELLED'}
                  onClick={() => {
                    void (async () => {
                      setBusy(true)
                      const result = await updateCalendarEvent({
                        id: event.id,
                        cancelScope: 'one',
                        occurrenceStartsAt: event.occurrenceStartsAt,
                      })
                      setBusy(false)
                      if (!result.ok) {
                        setError(result.error.message)
                        return
                      }
                      setToast('This occurrence cancelled.')
                      navigate(backHref)
                    })()
                  }}
                >
                  Cancel this day
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy || event.status === 'CANCELLED'}
                  onClick={() => {
                    void (async () => {
                      setBusy(true)
                      const result = await updateCalendarEvent({
                        id: event.id,
                        cancelScope: 'series',
                        status: 'CANCELLED',
                      })
                      setBusy(false)
                      if (!result.ok) {
                        setError(result.error.message)
                        return
                      }
                      setToast('Series cancelled.')
                      navigate(backHref)
                    })()
                  }}
                >
                  Cancel series
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="secondary"
                disabled={busy || event.status === 'CANCELLED'}
                onClick={() => {
                  void (async () => {
                    setBusy(true)
                    const result = await updateCalendarEvent({
                      id: event.id,
                      status: 'CANCELLED',
                    })
                    setBusy(false)
                    if (!result.ok) {
                      setError(result.error.message)
                      return
                    }
                    setToast('Event cancelled.')
                    navigate(backHref)
                  })()
                }}
              >
                Cancel event
              </Button>
            )}
          </div>
        </Card>
      </Section>

      <Section title="RSVPs">
        <Card>
          {rsvpCounts ? <Badge tone="green">{formatRsvpCounts(rsvpCounts)}</Badge> : null}
          <ul className="calendar-rsvp-list">
            {rsvps.length === 0 ? (
              <li className="field__hint">No one invited yet.</li>
            ) : (
              rsvps.map((row) => (
                <li key={row.id}>
                  <div>
                    <Link to={`/leader/contacts/${row.personId}`}>
                      {row.person.displayName}
                    </Link>
                  </div>
                  <div className="btn-row">
                    <Select
                      aria-label={`RSVP for ${row.person.displayName}`}
                      value={row.status}
                      disabled={busy}
                      onChange={(e) => {
                        void (async () => {
                          setBusy(true)
                          const result = await setEventRsvp({
                            eventId: event.id,
                            personId: row.personId,
                            status: e.target.value as 'INVITED' | 'YES' | 'NO' | 'MAYBE',
                          })
                          setBusy(false)
                          if (!result.ok) {
                            setError(result.error.message)
                            return
                          }
                          setRsvps(result.data.rsvps)
                          setRsvpCounts(result.data.counts)
                        })()
                      }}
                    >
                      <option value="INVITED">Invited</option>
                      <option value="YES">Yes</option>
                      <option value="MAYBE">Maybe</option>
                      <option value="NO">No</option>
                    </Select>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => {
                        void (async () => {
                          setBusy(true)
                          const result = await removeEventRsvp(event.id, row.personId)
                          setBusy(false)
                          if (!result.ok) {
                            setError(result.error.message)
                            return
                          }
                          setRsvps(result.data.rsvps)
                          setRsvpCounts(result.data.counts)
                        })()
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <Field id="rsvp-invite" label="Invite from roster">
            <Input
              id="rsvp-invite"
              value={inviteQ}
              onChange={(e) => setInviteQ(e.target.value)}
              placeholder="Search name…"
            />
          </Field>
          {inviteResults.length > 0 ? (
            <ul className="calendar-invite-list">
              {inviteResults.map((person) => (
                <li key={person.id}>
                  <span>{person.displayName}</span>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy}
                    onClick={() => {
                      void (async () => {
                        setBusy(true)
                        const result = await inviteEventRsvps(event.id, [person.id])
                        setBusy(false)
                        if (!result.ok) {
                          setError(result.error.message)
                          return
                        }
                        setRsvps(result.data.rsvps)
                        setRsvpCounts(result.data.counts)
                        setInviteQ('')
                        setInviteResults([])
                        setToast('Invited.')
                      })()
                    }}
                  >
                    Invite
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </Section>
    </div>
  )
}

export function CalendarEventDetailPage() {
  return (
    <RequireLeaderAccess>
      <EventDetail />
    </RequireLeaderAccess>
  )
}
