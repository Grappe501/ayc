import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  Textarea,
} from '@/components/ui'
import { TEAMS } from '@/content/ayc'
import { CalendarBoard } from '@/features/calendar/CalendarBoard'
import {
  rangeForView,
  startOfMonth,
  type CalendarViewMode,
} from '@/features/calendar/calendarDates'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  createCalendarEvent,
  downloadCalendarIcs,
  fetchCalendarEvents,
  type CalendarBoardRef,
  type CalendarEventItem,
} from '@/features/leader/leaderApi'
import './leader-board.css'
import './calendar.css'

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function CalendarHub() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const boardSlug = params.get('board') ?? (params.get('locationId') ? undefined : 'main')
  const locationId = params.get('locationId') ?? undefined
  const teamSlug = params.get('teamSlug') ?? undefined
  const mode = params.get('mode') === 'own' ? 'own' : 'rollup'

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<CalendarViewMode>('month')
  const [board, setBoard] = useState<CalendarBoardRef | null>(null)
  const [events, setEvents] = useState<CalendarEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [reload, setReload] = useState(0)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationText, setLocationText] = useState('')
  const [url, setUrl] = useState('')
  const [visibility, setVisibility] = useState<'INTERNAL' | 'PUBLIC'>('INTERNAL')
  const [allDay, setAllDay] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('NONE')
  const [recurrenceInterval, setRecurrenceInterval] = useState('1')
  const [recurrenceCount, setRecurrenceCount] = useState('')
  const [recurrenceUntil, setRecurrenceUntil] = useState('')
  const [startsAt, setStartsAt] = useState(() => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 1)
    return toLocalInputValue(d)
  })
  const [endsAt, setEndsAt] = useState(() => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 2)
    return toLocalInputValue(d)
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const { from, to } = rangeForView(view, cursor)
      const result = await fetchCalendarEvents({
        boardSlug,
        locationId,
        teamSlug,
        mode,
        from: from.toISOString(),
        to: to.toISOString(),
      })
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setBoard(null)
        setEvents([])
        setLoading(false)
        return
      }
      setBoard(result.data.board)
      setEvents(result.data.events)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [boardSlug, locationId, teamSlug, mode, cursor, view, reload])

  function setBoardParam(next: string) {
    const nextParams = new URLSearchParams()
    if (next.startsWith('loc:')) {
      nextParams.set('locationId', next.slice(4))
    } else {
      nextParams.set('board', next)
    }
    if (mode === 'own') nextParams.set('mode', 'own')
    setParams(nextParams)
  }

  function openEvent(item: { id: string; startsAt: string }) {
    const qs = new URLSearchParams()
    if (boardSlug) qs.set('board', boardSlug)
    if (locationId) qs.set('locationId', locationId)
    if (teamSlug) qs.set('teamSlug', teamSlug)
    qs.set('occurrence', item.startsAt)
    navigate(`/leader/calendar/event/${item.id}?${qs.toString()}`)
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setToast('')
    setError('')
    const result = await createCalendarEvent({
      boardSlug: locationId ? undefined : boardSlug,
      locationId,
      teamSlug,
      title: title.trim(),
      description: description.trim() || null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      allDay,
      locationText: locationText.trim() || null,
      url: url.trim() || null,
      visibility,
      recurrenceFrequency:
        recurrenceFrequency === 'NONE' ? null : recurrenceFrequency,
      recurrenceInterval: Number(recurrenceInterval) || 1,
      recurrenceCount: recurrenceCount ? Number(recurrenceCount) : null,
      recurrenceUntil: recurrenceUntil
        ? new Date(`${recurrenceUntil}T23:59:59`).toISOString()
        : null,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setTitle('')
    setDescription('')
    setVisibility('INTERNAL')
    setRecurrenceFrequency('NONE')
    setRecurrenceCount('')
    setRecurrenceUntil('')
    setToast(
      visibility === 'PUBLIC' ? 'Public event created.' : 'Event created on this board calendar.',
    )
    setReload((n) => n + 1)
  }

  return (
    <div className="calendar-page">
      <PageHeader
        eyebrow="Nested calendars"
        title={board ? board.calendarName : 'Calendar'}
        lede="Month, week, and day views. Click an event title to open full details and RSVPs."
        actions={
          <>
            <Button to="/calendar" variant="secondary">
              Public calendar
            </Button>
            <Button to="/leader" variant="secondary">
              Leader Board
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

      <div className="calendar-toolbar">
        <Field id="cal-board" label="Board">
          <Select
            id="cal-board"
            value={locationId ? `loc:${locationId}` : (boardSlug ?? 'main')}
            onChange={(e) => setBoardParam(e.target.value)}
          >
            <option value="main">Main (Lead Organizer)</option>
            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} statewide
              </option>
            ))}
            <option value="graphic-design">Graphic Design</option>
            <option value="high-school">High School segment</option>
            <option value="working-class">Working Class segment</option>
            {locationId ? (
              <option value={`loc:${locationId}`}>This location TEAM</option>
            ) : null}
          </Select>
        </Field>
        <Field id="cal-mode" label="View scope">
          <Select
            id="cal-mode"
            value={mode}
            onChange={(e) => {
              const next = new URLSearchParams(params)
              if (e.target.value === 'own') next.set('mode', 'own')
              else next.delete('mode')
              setParams(next)
            }}
          >
            <option value="rollup">Rollup (this board + descendants)</option>
            <option value="own">This board only</option>
          </Select>
        </Field>
        <div className="btn-row" style={{ alignSelf: 'end' }}>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || loading}
            onClick={() => {
              void (async () => {
                setBusy(true)
                setError('')
                const { from } = rangeForView(view, cursor)
                const to = new Date(from)
                to.setMonth(to.getMonth() + 6)
                const result = await downloadCalendarIcs({
                  boardSlug,
                  locationId,
                  teamSlug,
                  mode,
                  from: from.toISOString(),
                  to: to.toISOString(),
                })
                setBusy(false)
                if (!result.ok) {
                  setError(result.error.message)
                  return
                }
                setToast('ICS calendar downloaded.')
              })()
            }}
          >
            Download ICS
          </Button>
        </div>
      </div>

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
      {loading && !board ? <LoadingState label="Loading calendar…" /> : null}

      {board ? (
        <div className="calendar-layout">
          <Section title="Calendar">
            <CalendarBoard
              events={events.map((item) => ({
                occurrenceKey: item.occurrenceKey,
                id: item.id,
                title: item.title,
                startsAt: item.startsAt,
                endsAt: item.endsAt,
                allDay: item.allDay,
                locationText: item.locationText,
                meta: `${item.sourceBoard.name}${item.visibility === 'PUBLIC' ? ' · Public' : ''}`,
              }))}
              view={view}
              cursor={cursor}
              onCursorChange={setCursor}
              onViewChange={setView}
              loading={loading}
              onEventClick={openEvent}
            />
          </Section>

          <Section title="Create event on this board">
            <Card>
              <p className="field__hint">
                Source: <strong>{board.name}</strong>. Click any event on the calendar for details
                and RSVPs.
              </p>
              <form onSubmit={onCreate} className="calendar-create">
                <Field id="cal-title" label="Title">
                  <Input
                    id="cal-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field id="cal-start" label="Starts">
                  <Input
                    id="cal-start"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                  />
                </Field>
                <Field id="cal-end" label="Ends">
                  <Input
                    id="cal-end"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                  />
                </Field>
                <label className="join-check">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                  />
                  <span>All day</span>
                </label>
                <Field id="cal-visibility" label="Visibility">
                  <Select
                    id="cal-visibility"
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(e.target.value as 'INTERNAL' | 'PUBLIC')
                    }
                  >
                    <option value="INTERNAL">Internal (leaders only)</option>
                    <option value="PUBLIC">Public (site + ICS feed)</option>
                  </Select>
                </Field>
                <Field id="cal-repeat" label="Repeat">
                  <Select
                    id="cal-repeat"
                    value={recurrenceFrequency}
                    onChange={(e) => setRecurrenceFrequency(e.target.value)}
                  >
                    <option value="NONE">Does not repeat</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </Select>
                </Field>
                {recurrenceFrequency !== 'NONE' ? (
                  <>
                    <Field id="cal-interval" label="Every">
                      <Select
                        id="cal-interval"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={String(n)}>
                            {n}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field id="cal-count" label="End after (count, optional)">
                      <Input
                        id="cal-count"
                        type="number"
                        min={1}
                        max={365}
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(e.target.value)}
                      />
                    </Field>
                    <Field id="cal-until" label="Or end on date (optional)">
                      <Input
                        id="cal-until"
                        type="date"
                        value={recurrenceUntil}
                        onChange={(e) => setRecurrenceUntil(e.target.value)}
                      />
                    </Field>
                  </>
                ) : null}
                <Field id="cal-place" label="Place (optional)">
                  <Input
                    id="cal-place"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                  />
                </Field>
                <Field id="cal-url" label="Link (optional)">
                  <Input
                    id="cal-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                  />
                </Field>
                <Field id="cal-notes" label="Description">
                  <Textarea
                    id="cal-notes"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </Field>
                <div className="btn-row">
                  <Button type="submit" variant="primary" disabled={busy}>
                    {busy ? 'Saving…' : 'Create event'}
                  </Button>
                </div>
              </form>
            </Card>
          </Section>
        </div>
      ) : null}
    </div>
  )
}

export function CalendarPage() {
  return (
    <RequireLeaderAccess>
      <CalendarHub />
    </RequireLeaderAccess>
  )
}
