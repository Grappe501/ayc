import { useEffect, useMemo, useState } from 'react'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import {
  Button,
  EmptyState,
  Field,
  LoadingState,
  PageHeader,
  Select,
  Tag,
} from '@/components/ui'
import {
  fetchPublicCalendarEvents,
  publicCalendarIcsHref,
  type PublicCalendarEvent,
} from '@/features/public/publicCalendarApi'
import './public-calendar.css'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function formatWhen(event: PublicCalendarEvent) {
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

export function PublicCalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<'list' | 'month'>('list')
  const [events, setEvents] = useState<PublicCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const from = startOfMonth(cursor).toISOString()
  const to = endOfMonth(cursor).toISOString()
  const icsHref = publicCalendarIcsHref({
    from,
    to: endOfMonth(new Date(cursor.getFullYear(), cursor.getMonth() + 5, 1)).toISOString(),
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const result = await fetchPublicCalendarEvents({ from, to })
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setEvents([])
        setLoading(false)
        return
      }
      setEvents(result.data.events)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [from, to])

  const days = useMemo(() => {
    const first = startOfMonth(cursor)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells: Array<{ date: Date | null; events: PublicCalendarEvent[] }> = []
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

  return (
    <div className="public-calendar">
      <DocumentMeta
        title="Public Calendar · Arkansas Youth Coalition"
        description="Upcoming public Arkansas Youth Coalition events. Subscribe with ICS or browse by month."
      />
      <PageHeader
        eyebrow="Open schedule"
        title="Public calendar"
        lede="Statewide and local events leaders have marked public. Internal planning stays off this page."
        actions={
          <>
            <Button to="/join" variant="primary">
              Join AYC
            </Button>
            <a className="btn btn--secondary" href={icsHref}>
              Subscribe ICS
            </a>
          </>
        }
      />

      <div className="public-calendar__toolbar">
        <Field id="pub-cal-view" label="Display">
          <Select
            id="pub-cal-view"
            value={view}
            onChange={(e) => setView(e.target.value as 'list' | 'month')}
          >
            <option value="list">List</option>
            <option value="month">Month</option>
          </Select>
        </Field>
        <div className="btn-row">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
          >
            Previous
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
            Next
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCursor(startOfMonth(new Date()))}
          >
            Today
          </Button>
        </div>
      </div>

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? <LoadingState label="Loading public events…" /> : null}

      {!loading && !error ? (
        view === 'list' ? (
          events.length === 0 ? (
            <EmptyState
              title="No public events this month"
              description="Leaders can mark an event Public from the Leadership calendar. Check back soon, or subscribe for updates."
            />
          ) : (
            <ul className="public-calendar__list">
              {events.map((item) => (
                <li key={item.occurrenceKey}>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="field__hint">{formatWhen(item)}</p>
                    {item.locationText ? (
                      <p className="field__hint">{item.locationText}</p>
                    ) : null}
                    {item.description ? (
                      <p className="field__hint">{item.description}</p>
                    ) : null}
                    <div className="btn-row">
                      <Tag>{item.sourceBoard.name}</Tag>
                      {item.recurrenceLabel ? <Tag>{item.recurrenceLabel}</Tag> : null}
                    </div>
                  </div>
                  {item.url ? (
                    <a
                      className="btn btn--secondary"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Details
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="public-calendar__month">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <div key={label} className="public-calendar__dow">
                {label}
              </div>
            ))}
            {days.map((cell, index) => (
              <div
                key={index}
                className={
                  cell.date
                    ? 'public-calendar__cell'
                    : 'public-calendar__cell public-calendar__cell--empty'
                }
              >
                {cell.date ? (
                  <>
                    <div className="public-calendar__day">{cell.date.getDate()}</div>
                    {cell.events.slice(0, 3).map((item) => (
                      <div key={item.occurrenceKey} className="public-calendar__chip" title={item.title}>
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
        )
      ) : null}
    </div>
  )
}
