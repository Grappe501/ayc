import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  Tag,
  Textarea,
} from '@/components/ui'
import { TEAMS } from '@/content/ayc'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  createCalendarEvent,
  fetchCalendarEvents,
  updateCalendarEvent,
  type CalendarBoardRef,
  type CalendarEventItem,
} from '@/features/leader/leaderApi'
import './leader-board.css'
import './calendar.css'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatWhen(event: CalendarEventItem) {
  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
  if (event.allDay) {
    return start.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }
  return `${start.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} – ${end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
}

function CalendarHub() {
  const [params, setParams] = useSearchParams()
  const boardSlug = params.get('board') ?? (params.get('locationId') ? undefined : 'main')
  const locationId = params.get('locationId') ?? undefined
  const teamSlug = params.get('teamSlug') ?? undefined
  const mode = params.get('mode') === 'own' ? 'own' : 'rollup'

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<'month' | 'list'>('list')
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
  const [allDay, setAllDay] = useState(false)
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
      const from = startOfMonth(cursor).toISOString()
      const to = endOfMonth(cursor).toISOString()
      const result = await fetchCalendarEvents({
        boardSlug,
        locationId,
        teamSlug,
        mode,
        from,
        to,
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
  }, [boardSlug, locationId, teamSlug, mode, cursor, reload])

  const days = useMemo(() => {
    const first = startOfMonth(cursor)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells: Array<{ date: Date | null; events: CalendarEventItem[] }> = []
    for (let i = 0; i < startWeekday; i += 1) cells.push({ date: null, events: [] })
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), day)
      const dayEvents = events.filter((event) => {
        const start = new Date(event.startsAt)
        return (
          start.getFullYear() === date.getFullYear() &&
          start.getMonth() === date.getMonth() &&
          start.getDate() === date.getDate()
        )
      })
      cells.push({ date, events: dayEvents })
    }
    return cells
  }, [cursor, events])

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
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setTitle('')
    setDescription('')
    setToast('Event created on this board calendar.')
    setReload((n) => n + 1)
  }

  async function cancelEvent(id: string) {
    setBusy(true)
    setError('')
    const result = await updateCalendarEvent({ id, status: 'CANCELLED' })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setToast('Event cancelled.')
    setReload((n) => n + 1)
  }

  return (
    <div className="calendar-page">
      <PageHeader
        eyebrow="Nested calendars"
        title={board ? board.calendarName : 'Calendar'}
        lede="Events are written once to a source board. Higher boards roll up descendants by query — nothing is copied."
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Leader Board
            </Button>
            <Button to="/leader/reports" variant="secondary">
              Reports
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
        <Field id="cal-view" label="Display">
          <Select
            id="cal-view"
            value={view}
            onChange={(e) => setView(e.target.value as 'month' | 'list')}
          >
            <option value="list">List</option>
            <option value="month">Month</option>
          </Select>
        </Field>
      </div>

      <div className="btn-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
        >
          Previous month
        </Button>
        <strong>
          {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </strong>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
        >
          Next month
        </Button>
        <Button type="button" variant="secondary" onClick={() => setCursor(startOfMonth(new Date()))}>
          Today
        </Button>
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
      {loading ? <LoadingState label="Loading calendar…" /> : null}

      {!loading && board ? (
        <div className="calendar-layout">
          <Section title={view === 'month' ? 'Month' : 'Upcoming in this month'}>
            {view === 'list' ? (
              events.length === 0 ? (
                <p className="field__hint">No events in this month for this rollup.</p>
              ) : (
                <ul className="calendar-event-list">
                  {events.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <p className="field__hint">{formatWhen(item)}</p>
                        {item.locationText ? (
                          <p className="field__hint">{item.locationText}</p>
                        ) : null}
                        <Tag>Belongs to {item.sourceBoard.name}</Tag>
                      </div>
                      <div className="btn-row">
                        {item.url ? (
                          <a
                            className="btn btn--secondary"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Link
                          </a>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => void cancelEvent(item.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="calendar-month">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                  <div key={label} className="calendar-month__dow">
                    {label}
                  </div>
                ))}
                {days.map((cell, index) => (
                  <div
                    key={index}
                    className={
                      cell.date
                        ? 'calendar-month__cell'
                        : 'calendar-month__cell calendar-month__cell--empty'
                    }
                  >
                    {cell.date ? (
                      <>
                        <div className="calendar-month__day">{cell.date.getDate()}</div>
                        {cell.events.slice(0, 3).map((item) => (
                          <div key={item.id} className="calendar-month__event" title={item.sourceBoard.name}>
                            {item.title}
                          </div>
                        ))}
                        {cell.events.length > 3 ? (
                          <div className="field__hint">+{cell.events.length - 3} more</div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Create event on this board">
            <Card>
              <p className="field__hint">
                Source: <strong>{board.name}</strong>. Parents will see it in rollup views.
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
