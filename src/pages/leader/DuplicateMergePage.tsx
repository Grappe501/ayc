import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  LoadingState,
  PageHeader,
  Section,
  StatCard,
  Tag,
} from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import {
  fetchDuplicateQueue,
  mergeContacts,
  type DuplicateQueueItem,
  type DuplicateQueuePerson,
} from '@/features/leader/leaderApi'
import './leader-board.css'

function resultLabel(result: DuplicateQueueItem['result']) {
  if (result === 'EXACT_MATCH') return 'Exact match'
  if (result === 'LIKELY_MATCH') return 'Likely match'
  return 'Possible match'
}

function PersonCard({
  person,
  selected,
  onSelect,
  label,
}: {
  person: DuplicateQueuePerson
  selected: boolean
  onSelect: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className={
        selected
          ? 'duplicate-person-card duplicate-person-card--selected'
          : 'duplicate-person-card'
      }
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="duplicate-person-card__top">
        <Tag>{person.status}</Tag>
        {selected ? <Tag>Keep this one</Tag> : <span className="field__hint">{label}</span>}
      </div>
      <h3>{person.displayName}</h3>
      <p>
        {person.location
          ? `${person.location.code} · ${person.location.name}`
          : 'No location'}
      </p>
      <p>
        {person.primaryTeam
          ? `${person.primaryTeam.name} · ${person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}`
          : 'No primary team'}
      </p>
      <p>{person.email ?? 'No email'}</p>
      <p>{person.phone ?? 'No phone'}</p>
      <p className="field__hint">
        <Link to={`/leader/contacts/${person.id}`} onClick={(e) => e.stopPropagation()}>
          Open full record
        </Link>
      </p>
    </button>
  )
}

function DuplicateMergeBoard() {
  const [items, setItems] = useState<DuplicateQueueItem[]>([])
  const [exact, setExact] = useState(0)
  const [likely, setLikely] = useState(0)
  const [possible, setPossible] = useState(0)
  const [index, setIndex] = useState(0)
  const [survivorId, setSurvivorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [mergedSession, setMergedSession] = useState(0)

  async function loadQueue() {
    setLoading(true)
    setError('')
    const result = await fetchDuplicateQueue()
    if (!result.ok) {
      setError(result.error.message)
      setLoading(false)
      return
    }
    setItems(result.data.items)
    setExact(result.data.exact)
    setLikely(result.data.likely)
    setPossible(result.data.possible)
    setIndex(0)
    const first = result.data.items[0]
    setSurvivorId(first?.suggestedSurvivorId ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void loadQueue()
  }, [])

  const current = items[index] ?? null

  useEffect(() => {
    if (current) setSurvivorId(current.suggestedSurvivorId)
  }, [current])

  const progressLabel = useMemo(() => {
    if (items.length === 0) return 'No duplicate pairs in queue'
    return `Pair ${Math.min(index + 1, items.length)} of ${items.length}`
  }, [index, items.length])

  function skip() {
    if (items.length === 0) return
    setIndex((value) => (value >= items.length - 1 ? 0 : value + 1))
    setError('')
    setToast('')
  }

  async function onMerge() {
    if (!current || !survivorId) return
    const mergedPersonId =
      current.left.id === survivorId ? current.right.id : current.left.id
    setBusy(true)
    setError('')
    setToast('')
    try {
      const result = await mergeContacts({
        survivingPersonId: survivorId,
        mergedPersonId,
        reason: 'DUPLICATE_RECORD',
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setMergedSession((n) => n + 1)
      setToast(result.data.summary)
      setItems((prev) => {
        const next = prev.filter((item) => item.key !== current.key)
        setIndex((i) => (i >= next.length ? Math.max(0, next.length - 1) : i))
        return next
      })
      setExact((n) => (current.result === 'EXACT_MATCH' ? Math.max(0, n - 1) : n))
      setLikely((n) => (current.result === 'LIKELY_MATCH' ? Math.max(0, n - 1) : n))
      setPossible((n) => (current.result === 'POSSIBLE_MATCH' ? Math.max(0, n - 1) : n))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Duplicate merge"
        title="Review duplicate people"
        lede="Compare possible matches, keep one record, and merge the other. Contact methods, teams, and locations move to the survivor; the duplicate is archived."
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Back to Leader Board
            </Button>
            <Button type="button" variant="secondary" onClick={() => void loadQueue()}>
              Refresh queue
            </Button>
          </>
        }
      />

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(items.length)} label="Pairs in queue" />
        <StatCard value={String(exact)} label="Exact matches" />
        <StatCard value={String(mergedSession)} label="Merged this session" />
      </div>
      <p className="field__hint" style={{ marginTop: '-0.5rem' }}>
        Likely: {likely} · Possible: {possible}
      </p>

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

      {loading ? <LoadingState label="Scanning for duplicates…" /> : null}

      {!loading && items.length === 0 ? (
        <Section id="done" title="Queue clear">
          <Card>
            <Tag>Caught up</Tag>
            <h3>No duplicate pairs right now.</h3>
            <p>
              Exact email/phone matches and same-name + location matches will show up here for
              review.
            </p>
            <Button to="/leader" variant="primary">
              Leader Board
            </Button>
          </Card>
        </Section>
      ) : null}

      {!loading && current ? (
        <div className="gap-fill-layout">
          <Section id="current" title="Compare and merge">
            <p className="field__hint">{progressLabel}</p>
            <Card>
              <Tag>{resultLabel(current.result)}</Tag>
              <h3>
                {current.left.displayName} ↔ {current.right.displayName}
              </h3>
              <ul className="duplicate-reason-list">
                {current.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <p className="field__hint">
                Tap the record to keep. The other person will be archived as a duplicate.
              </p>

              <div className="duplicate-compare">
                <PersonCard
                  person={current.left}
                  selected={survivorId === current.left.id}
                  onSelect={() => setSurvivorId(current.left.id)}
                  label="Candidate A"
                />
                <PersonCard
                  person={current.right}
                  selected={survivorId === current.right.id}
                  onSelect={() => setSurvivorId(current.right.id)}
                  label="Candidate B"
                />
              </div>

              <div className="btn-row" style={{ marginTop: '1rem' }}>
                <Button type="button" variant="primary" disabled={busy || !survivorId} onClick={() => void onMerge()}>
                  {busy ? 'Merging…' : 'Merge into selected'}
                </Button>
                <Button type="button" variant="secondary" onClick={skip} disabled={busy}>
                  Skip
                </Button>
              </div>
            </Card>
          </Section>

          <Section id="queue" title="Up next">
            <ol className="gap-fill-queue">
              {items.map((item, i) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className={
                      i === index
                        ? 'gap-fill-queue__item gap-fill-queue__item--active'
                        : 'gap-fill-queue__item'
                    }
                    onClick={() => {
                      setIndex(i)
                      setError('')
                      setToast('')
                    }}
                  >
                    <strong>
                      {item.left.displayName} / {item.right.displayName}
                    </strong>
                    <span>{resultLabel(item.result)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p>
              <Link to="/leader">Return to Leader Board</Link>
            </p>
          </Section>
        </div>
      ) : null}
    </div>
  )
}

export function DuplicateMergePage() {
  return (
    <RequireLeaderAccess requireStatewide>
      <DuplicateMergeBoard />
    </RequireLeaderAccess>
  )
}
