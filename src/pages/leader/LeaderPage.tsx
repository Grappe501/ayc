import { useEffect, useState } from 'react'
import { Badge, Button, Card, EmptyState, PageHeader, Section, StatCard, Tag } from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import { fetchLeaderSummary, fetchRecentContacts } from '@/features/leader/leaderApi'

function LeaderBoard() {
  const [stats, setStats] = useState({
    activePeople: 0,
    leads: 0,
    volunteers: 0,
    locationsRepresented: 0,
  })
  const [recent, setRecent] = useState<
    Array<{
      id: string
      displayName: string | null
      firstName: string
      lastName: string
      status: string
      createdAt: string
    }>
  >([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, contacts] = await Promise.all([
        fetchLeaderSummary(),
        fetchRecentContacts(),
      ])
      if (cancelled) return
      if (!summary.ok) {
        setError(summary.error.message)
        return
      }
      setStats(summary.data)
      if (contacts.ok) setRecent(contacts.data)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Leader Board"
        title="Leader Board"
        lede="Build and maintain the AYC leadership network."
        actions={
          <>
            <Button to="/leader/contacts/new" variant="primary">
              Add a Contact
            </Button>
            <Button to="/directory" variant="secondary">
              View Directory
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
        <StatCard value={String(stats.activePeople)} label="Active People" />
        <StatCard value={String(stats.leads)} label="Leads" />
        <StatCard value={String(stats.volunteers)} label="Volunteers" />
        <StatCard value={String(stats.locationsRepresented)} label="Locations Represented" />
      </div>

      <Section id="recent" title="Recently added">
        {recent.length === 0 ? (
          <EmptyState
            icon="+"
            title="No contacts yet"
            description="Add the first leadership contact to start the statewide directory."
            actionTo="/leader/contacts/new"
            actionLabel="Add a Contact"
          >
            <Badge tone="gold">Ready for entry</Badge>
          </EmptyState>
        ) : (
          <div className="card-grid card-grid--2">
            {recent.map((person) => (
              <Card key={person.id}>
                <Tag>{person.status}</Tag>
                <h3>
                  {person.displayName ?? `${person.firstName} ${person.lastName}`}
                </h3>
                <p className="field__hint">
                  Added {new Date(person.createdAt).toLocaleDateString()}
                </p>
                <div className="btn-row">
                  <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                    Open
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

export function LeaderPage() {
  return (
    <RequireLeaderAccess>
      <LeaderBoard />
    </RequireLeaderAccess>
  )
}
