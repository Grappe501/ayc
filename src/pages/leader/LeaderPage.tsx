import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import {
  LeaderAccessGate,
  clearLeaderSession,
  hasLeaderSession,
} from '@/features/leader/LeaderAccessGate'
import '@/components/ui/ui.css'

export function LeaderPage() {
  const [unlocked, setUnlocked] = useState(() => hasLeaderSession())

  if (!unlocked) {
    return <LeaderAccessGate onUnlocked={() => setUnlocked(true)} />
  }

  return (
    <div>
      <p className="page-eyebrow">Leader Board</p>
      <h1>Build and maintain the AYC leadership network.</h1>
      <p className="page-lede">Create contacts, locations, and team assignments for the statewide directory.</p>
      <div className="btn-row" style={{ marginBottom: '1.5rem' }}>
        <Button to="/leader/contacts/new" variant="primary">
          Add a Contact
        </Button>
        <Button to="/directory" variant="secondary">
          View Directory
        </Button>
      </div>

      <section className="section" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading">Summary</h2>
        <div className="card-grid card-grid--2">
          {[
            ['Active People', '0'],
            ['Leads', '0'],
            ['Volunteers', '0'],
            ['Locations Represented', '0'],
          ].map(([label, value]) => (
            <article key={label} className="content-card surface">
              <p className="page-eyebrow">{label}</p>
              <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{value}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="recent-heading">
        <h2 id="recent-heading">Recently added</h2>
        <div className="surface empty-panel">
          <p>No contacts have been added yet.</p>
          <p>Start by adding the first AYC leader or volunteer.</p>
          <Button to="/leader/contacts/new" variant="primary">
            Add the First Contact
          </Button>
        </div>
      </section>

      <section className="section" aria-labelledby="attention-heading">
        <h2 id="attention-heading">Needs attention</h2>
        <div className="surface empty-panel">
          <p>Nothing needs attention right now.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="quick-heading">
        <h2 id="quick-heading">Quick actions</h2>
        <div className="btn-row">
          <Button to="/leader/contacts/new" variant="primary">
            Add Contact
          </Button>
          <Button to="/directory" variant="secondary">
            Search Directory
          </Button>
          <Button to="/feedback" variant="secondary">
            Send Beta Feedback
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={() => {
              clearLeaderSession()
              setUnlocked(false)
            }}
          >
            Lock Leader Board
          </Button>
        </div>
        <p className="field__hint" style={{ color: 'var(--color-light-gray)' }}>
          Server-validated write PIN arrives with Phase 1D. Local unlock is for interface development
          only.
        </p>
        <p>
          <Link to="/leader/contacts/new">Continue to contact form route</Link>
        </p>
      </section>
    </div>
  )
}
