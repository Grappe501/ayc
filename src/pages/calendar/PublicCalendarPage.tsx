import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, EmptyState, LoadingState, PageHeader } from '@/components/ui'
import { CalendarBoard } from '@/features/calendar/CalendarBoard'
import {
  rangeForView,
  startOfMonth,
  type CalendarViewMode,
} from '@/features/calendar/calendarDates'
import {
  fetchPublicCalendarEvents,
  publicCalendarIcsHref,
  type PublicCalendarEvent,
} from '@/features/public/publicCalendarApi'
import './public-calendar.css'

export function PublicCalendarPage() {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<CalendarViewMode>('month')
  const [events, setEvents] = useState<PublicCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const range = rangeForView(view, cursor)
  const icsHref = publicCalendarIcsHref({
    from: range.from.toISOString(),
    to: (() => {
      const end = new Date(range.from)
      end.setMonth(end.getMonth() + 6)
      return end.toISOString()
    })(),
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const { from, to } = rangeForView(view, cursor)
      const result = await fetchPublicCalendarEvents({
        from: from.toISOString(),
        to: to.toISOString(),
      })
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
  }, [cursor, view])

  return (
    <div className="public-calendar">
      <DocumentMeta
        title="Public Calendar · Arkansas Youth Coalition"
        description="Upcoming public Arkansas Youth Coalition events. Month, week, and day views."
      />
      <PageHeader
        eyebrow="Open schedule"
        title="Public calendar"
        lede="Month, week, and day views of events leaders have marked public. Click a title for details."
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

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}
      {loading && events.length === 0 ? (
        <LoadingState label="Loading public events…" />
      ) : null}

      {!loading && !error && events.length === 0 && view === 'month' ? (
        <EmptyState
          title="No public events in this range"
          description="Leaders can mark an event Public from the Leadership calendar."
        />
      ) : null}

      <CalendarBoard
        events={events.map((item) => ({
          occurrenceKey: item.occurrenceKey,
          id: item.id,
          title: item.title,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          allDay: item.allDay,
          locationText: item.locationText,
          meta: item.sourceBoard.name,
        }))}
        view={view}
        cursor={cursor}
        onCursorChange={setCursor}
        onViewChange={setView}
        loading={loading}
        onEventClick={(event) => {
          navigate(
            `/calendar/event/${event.id}?occurrence=${encodeURIComponent(event.startsAt)}`,
          )
        }}
      />
    </div>
  )
}
