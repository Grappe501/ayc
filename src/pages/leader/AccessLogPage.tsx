import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  LoadingState,
  PageHeader,
  Section,
  Tag,
} from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchAccessAuditLog,
  type AccessAuditEvent,
} from '@/features/leader/leaderApi'
import './leader-board.css'

function labelEventType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function AccessLogHub() {
  const [events, setEvents] = useState<AccessAuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const result = await fetchAccessAuditLog(150)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      setEvents(result.data.events)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Accountability"
        title="Access log"
        lede="Who unlocked boards, signed in, claimed invites, and accepted or declined applications. Lead Organizer only."
        actions={
          <>
            <Button to="/leader/reports" variant="secondary">
              Reports
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

      {loading ? <LoadingState label="Loading access events…" /> : null}
      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <Section id="access-events" title="Recent access events">
          {events.length === 0 ? (
            <Card>
              <p className="field__hint">
                No unlock, login, invite, role, or application decisions recorded yet. Unlock a board
                or accept an application to see entries here.
              </p>
            </Card>
          ) : (
            <ul className="segment-people-list">
              {events.map((event) => (
                <li key={event.id}>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      <Tag>{labelEventType(event.eventType)}</Tag>
                      <strong>{event.actorLabel || 'Unknown actor'}</strong>
                    </div>
                    <p className="field__hint" style={{ margin: '0.35rem 0 0' }}>
                      {event.changeSummary}
                    </p>
                  </div>
                  <span className="field__hint">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      ) : null}
    </div>
  )
}

export function AccessLogPage() {
  return (
    <RequireLeaderAccess requireMaster>
      <AccessLogHub />
    </RequireLeaderAccess>
  )
}
