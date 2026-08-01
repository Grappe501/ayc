import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, LoadingState, Section } from '@/components/ui'
import {
  fetchCalendarEvents,
  type CalendarEventItem,
} from '@/features/leader/leaderApi'
import { CalendarBoard, type CalendarBoardEvent } from './CalendarBoard'
import { rangeForView, startOfMonth, type CalendarViewMode } from './calendarDates'

type Props = {
  boardSlug?: string
  locationId?: string
  teamSlug?: string
  mode?: 'rollup' | 'own'
  title?: string
  compact?: boolean
}

function toBoardEvent(item: CalendarEventItem): CalendarBoardEvent {
  return {
    occurrenceKey: item.occurrenceKey,
    id: item.id,
    title: item.title,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    allDay: item.allDay,
    locationText: item.locationText,
    meta: item.sourceBoard.name,
  }
}

export function BoardCalendarPanel({
  boardSlug,
  locationId,
  teamSlug,
  mode = 'rollup',
  title = 'Calendar',
  compact = true,
}: Props) {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<CalendarViewMode>('month')
  const [events, setEvents] = useState<CalendarEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }, [boardSlug, locationId, teamSlug, mode, cursor, view])

  const params = new URLSearchParams()
  if (boardSlug) params.set('board', boardSlug)
  if (locationId) params.set('locationId', locationId)
  if (teamSlug) params.set('teamSlug', teamSlug)
  if (mode === 'own') params.set('mode', 'own')
  const hubHref = `/leader/calendar${params.toString() ? `?${params}` : ''}`

  return (
    <Section
      title={title}
      actions={
        <Button to={hubHref} variant="secondary">
          Open full calendar
        </Button>
      }
    >
      <Card>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        {loading && events.length === 0 ? (
          <LoadingState label="Loading calendar…" />
        ) : (
          <CalendarBoard
            events={events.map(toBoardEvent)}
            view={view}
            cursor={cursor}
            onCursorChange={setCursor}
            onViewChange={setView}
            loading={loading}
            compact={compact}
            onEventClick={(event) => {
              const qs = new URLSearchParams(params)
              qs.set('occurrence', event.startsAt)
              navigate(`/leader/calendar/event/${event.id}?${qs.toString()}`)
            }}
          />
        )}
      </Card>
    </Section>
  )
}
