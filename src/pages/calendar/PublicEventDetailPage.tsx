import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, Card, LoadingState, PageHeader, Section, Tag } from '@/components/ui'
import {
  fetchPublicCalendarEvents,
  type PublicCalendarEvent,
} from '@/features/public/publicCalendarApi'

function formatWhen(event: PublicCalendarEvent) {
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

export function PublicEventDetailPage() {
  const { eventId = '' } = useParams()
  const [params] = useSearchParams()
  const occurrence = params.get('occurrence')
  const [event, setEvent] = useState<PublicCalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const from = new Date()
      from.setMonth(from.getMonth() - 2)
      const to = new Date()
      to.setMonth(to.getMonth() + 8)
      const result = await fetchPublicCalendarEvents({
        from: from.toISOString(),
        to: to.toISOString(),
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
      setError(found ? '' : 'This public event could not be found.')
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [eventId, occurrence])

  if (loading) return <LoadingState label="Loading event…" />

  if (!event) {
    return (
      <div>
        <PageHeader title="Event not found" lede={error || 'This event is not available.'} />
        <Button to="/calendar" variant="secondary">
          Back to calendar
        </Button>
      </div>
    )
  }

  return (
    <div>
      <DocumentMeta
        title={`${event.title} · AYC Calendar`}
        description={event.description || formatWhen(event)}
      />
      <PageHeader
        eyebrow="Public event"
        title={event.title}
        lede={formatWhen(event)}
        actions={
          <Button to="/calendar" variant="secondary">
            Back to calendar
          </Button>
        }
      />
      <Section title="Details">
        <Card>
          <div className="btn-row">
            <Tag>{event.sourceBoard.name}</Tag>
            {event.recurrenceLabel ? <Tag>{event.recurrenceLabel}</Tag> : null}
          </div>
          {event.locationText ? (
            <p>
              <strong>Place:</strong> {event.locationText}
            </p>
          ) : null}
          {event.description ? <p>{event.description}</p> : null}
          {event.url ? (
            <p>
              <a className="btn btn--primary" href={event.url} target="_blank" rel="noreferrer">
                Open link
              </a>
            </p>
          ) : null}
        </Card>
      </Section>
    </div>
  )
}
