import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  StatCard,
  Tag,
} from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { fillContactGap } from '@/features/leader/fillContactGap'
import {
  fetchLeaderRoster,
  fetchTeams,
  type LeaderRosterRow,
} from '@/features/leader/leaderApi'
import './leader-board.css'

function GapFillBoard() {
  const [queue, setQueue] = useState<LeaderRosterRow[]>([])
  const [index, setIndex] = useState(0)
  const [teams, setTeams] = useState<Array<{ slug: string; name: string }>>([])
  const [teamFilter, setTeamFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [filledSession, setFilledSession] = useState(0)
  const [toast, setToast] = useState('')

  async function loadQueue(team?: string) {
    setLoading(true)
    setError('')
    const [roster, teamResult] = await Promise.all([
      fetchLeaderRoster({ team: team || undefined, gapsOnly: true }),
      fetchTeams(),
    ])
    if (teamResult.ok) {
      setTeams(teamResult.data.map((t) => ({ slug: t.slug, name: t.name })))
    }
    if (!roster.ok) {
      setError(roster.error.message)
      setLoading(false)
      return
    }
    setQueue(roster.data.people.filter((p) => p.missingContact))
    setIndex(0)
    setEmail('')
    setPhone('')
    setLoading(false)
  }

  useEffect(() => {
    void loadQueue(teamFilter)
  }, [teamFilter])

  const current = queue[index] ?? null
  const remaining = queue.length
  const progressLabel = useMemo(() => {
    if (remaining === 0) return 'All visible gaps filled'
    return `Person ${Math.min(index + 1, remaining)} of ${remaining} in queue`
  }, [index, remaining])

  function skip() {
    if (index >= queue.length - 1) {
      setIndex(0)
    } else {
      setIndex((value) => value + 1)
    }
    setEmail('')
    setPhone('')
    setToast('')
    setError('')
  }

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!current) return
    setBusy(true)
    setError('')
    setToast('')
    try {
      const result = await fillContactGap(current.id, { email, phone })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setFilledSession((n) => n + 1)
      setToast(`Saved ${result.displayName}`)
      setQueue((prev) => {
        const next = prev.filter((p) => p.id !== current.id)
        setIndex((i) => (i >= next.length ? Math.max(0, next.length - 1) : i))
        return next
      })
      setEmail('')
      setPhone('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contact Gap Fill"
        title="Contact Gap Fill Sprint"
        lede="Work through people missing phone and email one at a time. Enter what you have, save, and move to the next."
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Back to Leader Board
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadQueue(teamFilter)}
            >
              Refresh queue
            </Button>
          </>
        }
      />

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(remaining)} label="Still missing contact" />
        <StatCard value={String(filledSession)} label="Filled this session" />
        <StatCard value={String(queue.length ? index + 1 : 0)} label="Queue position" />
      </div>

      <div className="leader-board-filters leader-board-filters--team">
        <Field id="gap-team" label="Team filter">
          <Select
            id="gap-team"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team.slug} value={team.slug}>
                {team.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}
      {toast ? (
        <p className="field__hint" role="status">
          {toast}
        </p>
      ) : null}

      {loading ? <LoadingState label="Loading gap queue…" /> : null}

      {!loading && remaining === 0 ? (
        <Section id="done" title="Sprint complete for this filter">
          <Card>
            <Tag>Caught up</Tag>
            <h3>No contact gaps in this queue.</h3>
            <p>Clear the team filter or return to the Leader Board for the full roster.</p>
            <div className="btn-row">
              <Button to="/leader" variant="primary">
                Leader Board
              </Button>
              <Button type="button" variant="secondary" onClick={() => setTeamFilter('')}>
                Show all teams
              </Button>
            </div>
          </Card>
        </Section>
      ) : null}

      {!loading && current ? (
        <div className="gap-fill-layout">
          <Section id="current" title="Fill this contact">
            <p className="field__hint">{progressLabel}</p>
            <Card>
              <Tag>{current.status}</Tag>
              <h3>{current.displayName}</h3>
              <p>
                {current.location
                  ? `${current.location.code} · ${current.location.name}`
                  : 'No location yet'}
              </p>
              <p>
                {current.primaryTeam
                  ? `${current.primaryTeam.name} · ${current.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}`
                  : 'No primary team'}
              </p>

              <form className="gap-fill-form" onSubmit={onSave}>
                <Field id="gap-phone" label="Mobile phone">
                  <Input
                    id="gap-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(501) 555-0100"
                  />
                </Field>
                <Field id="gap-email" label="Email">
                  <Input
                    id="gap-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </Field>
                <p className="field__hint">Enter at least one. Both is better.</p>
                <div className="btn-row">
                  <Button type="submit" variant="primary" disabled={busy}>
                    {busy ? 'Saving…' : 'Save & next'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={skip} disabled={busy}>
                    Skip
                  </Button>
                  <Button
                    to={`/leader/contacts/${current.id}`}
                    variant="secondary"
                  >
                    Open full record
                  </Button>
                </div>
              </form>
            </Card>
          </Section>

          <Section id="queue" title="Up next">
            <ol className="gap-fill-queue">
              {queue.map((person, i) => (
                <li key={person.id}>
                  <button
                    type="button"
                    className={
                      i === index
                        ? 'gap-fill-queue__item gap-fill-queue__item--active'
                        : 'gap-fill-queue__item'
                    }
                    onClick={() => {
                      setIndex(i)
                      setEmail('')
                      setPhone('')
                      setError('')
                      setToast('')
                    }}
                  >
                    <strong>{person.displayName}</strong>
                    <span>
                      {person.primaryTeam?.name ?? 'No team'}
                      {person.location ? ` · ${person.location.code}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="field__hint">
              Tip: keep this page open while you text or call; save as numbers come in.
            </p>
            <p>
              <Link to="/leader">Return to Leader Board</Link>
            </p>
          </Section>
        </div>
      ) : null}
    </div>
  )
}

export function GapFillPage() {
  return (
    <RequireLeaderAccess>
      <GapFillBoard />
    </RequireLeaderAccess>
  )
}
