import { useEffect, useRef, useState } from 'react'
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
  Textarea,
} from '@/components/ui'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import {
  fetchLeaderApplications,
  updateLeaderApplication,
  type MembershipApplicationItem,
} from '@/features/leader/leaderApi'
import './leader-board.css'
import './feedback-inbox.css'

const STATUSES = ['NEW', 'REVIEWING', 'DUPLICATE', 'ACCEPTED', 'DECLINED'] as const

const TEAM_LABELS: Record<string, string> = {
  organizer: 'Organizer',
  'voter-registration': 'Voter Registration',
  'social-media': 'Social Media',
  events: 'Events',
  outreach: 'Outreach',
  'graphic-design': 'Graphic Design',
}

function labelStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function teamLabel(slug: string) {
  return TEAM_LABELS[slug] ?? slug
}

function ApplicationsInbox() {
  const [items, setItems] = useState<MembershipApplicationItem[]>([])
  const [total, setTotal] = useState(0)
  const [openCount, setOpenCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('OPEN')
  const [searchDraft, setSearchDraft] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const preferSelectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => setQ(searchDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const statusParam =
        statusFilter === 'ALL' || statusFilter === 'OPEN' ? undefined : statusFilter
      const result = await fetchLeaderApplications({
        status: statusParam,
        q: q || undefined,
      })
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      let nextItems = result.data.items
      if (statusFilter === 'OPEN') {
        nextItems = nextItems.filter((item) =>
          ['NEW', 'REVIEWING', 'DUPLICATE'].includes(item.status),
        )
      }
      setItems(nextItems)
      setTotal(result.data.total)
      setOpenCount(result.data.openCount)
      setLoading(false)
      if (nextItems.length === 0) {
        setSelectedId(null)
        preferSelectedIdRef.current = null
        return
      }
      const preferred = preferSelectedIdRef.current
      preferSelectedIdRef.current = null
      setSelectedId((current) => {
        const next = preferred ?? current
        if (next && nextItems.some((item) => item.id === next)) return next
        return nextItems[0]!.id
      })
    })()
    return () => {
      cancelled = true
    }
  }, [statusFilter, q, reloadToken])

  const selected = items.find((item) => item.id === selectedId) ?? null

  useEffect(() => {
    if (!selected) return
    setNotes(selected.reviewNotes ?? '')
  }, [selected])

  async function runAction(action: 'review' | 'accept' | 'decline') {
    if (!selected) return
    setBusy(true)
    setToast('')
    const result = await updateLeaderApplication({
      id: selected.id,
      action,
      reviewNotes: notes.trim() || null,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    preferSelectedIdRef.current = selected.id
    setReloadToken((n) => n + 1)
    if (action === 'accept') {
      const personId = result.data.personId
      setToast(
        result.data.created
          ? `Accepted — person created${personId ? ` (${personId.slice(0, 8)})` : ''}.`
          : `Accepted — linked existing contact.`,
      )
    } else if (action === 'decline') {
      setToast('Application declined.')
    } else {
      setToast('Marked reviewing.')
    }
  }

  const closed = selected
    ? selected.status === 'ACCEPTED' || selected.status === 'DECLINED'
    : true

  return (
    <div>
      <PageHeader
        eyebrow="Lead Organizer"
        title="Join applications"
        lede="Review public join submissions. Accept creates or links a Prospective person on the roster; decline closes the queue item."
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Leader Board
            </Button>
            <Button to="/leader/feedback" variant="secondary">
              Feedback inbox
            </Button>
          </>
        }
      />

      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        <StatCard label="Open applications" value={String(openCount)} />
        <StatCard label="Shown" value={String(items.length)} />
        <StatCard label="All applications" value={String(total)} />
      </div>

      {toast ? (
        <div className="success-state" role="status" style={{ marginBottom: '1rem' }}>
          {toast}
          {selected?.assignedToPersonId || selected?.matchedPersonId ? (
            <>
              {' '}
              <Button
                to={`/leader/contacts/${selected.assignedToPersonId ?? selected.matchedPersonId}`}
                variant="secondary"
              >
                Open contact
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      <div className="btn-row" style={{ marginBottom: '1rem' }}>
        <Field id="app-status" label="Status">
          <Select
            id="app-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="OPEN">Open queue</option>
            <option value="ALL">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {labelStatus(status)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="app-search" label="Search">
          <Input
            id="app-search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Name, email, reference…"
          />
        </Field>
      </div>

      {loading ? <LoadingState label="Loading applications…" /> : null}

      {!loading ? (
        <div className="feedback-inbox">
          <Section title="Queue">
            {items.length === 0 ? (
              <p className="field__hint">No applications in this view.</p>
            ) : (
              <ul className="feedback-inbox__list">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={
                        item.id === selectedId
                          ? 'feedback-inbox__item feedback-inbox__item--active'
                          : 'feedback-inbox__item'
                      }
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div className="feedback-inbox__item-top">
                        <strong>
                          {item.firstName} {item.lastName}
                        </strong>
                        <span>{item.referenceCode}</span>
                      </div>
                      <p className="feedback-inbox__snippet">
                        {teamLabel(item.primaryTeamInterest)} · {item.locationInterestType}
                        {item.city ? ` · ${item.city}` : ''}
                      </p>
                      <Tag>{labelStatus(item.status)}</Tag>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Review">
            {!selected ? (
              <p className="field__hint">Select an application.</p>
            ) : (
              <Card>
                <div className="btn-row">
                  <Tag>{labelStatus(selected.status)}</Tag>
                  <Tag>{teamLabel(selected.primaryTeamInterest)}</Tag>
                  {selected.wantsToLeadLocal ? <Tag>Local lead interest</Tag> : null}
                  {selected.wantsCategoryLead ? <Tag>Category lead interest</Tag> : null}
                </div>
                <h3 style={{ marginTop: '0.75rem' }}>
                  {selected.firstName} {selected.lastName}
                </h3>
                <p className="field__hint">{selected.referenceCode}</p>
                <div className="feedback-inbox__description">
                  <div>
                    <strong>Email:</strong> {selected.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selected.phone || '—'}
                  </div>
                  <div>
                    <strong>Path:</strong> {selected.locationInterestType}
                    {selected.locationNameFreeform
                      ? ` · ${selected.locationNameFreeform}`
                      : ''}
                  </div>
                  <div>
                    <strong>City / county:</strong>{' '}
                    {[selected.city, selected.county].filter(Boolean).join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Notes:</strong> {selected.experienceNotes || '—'}
                  </div>
                  {selected.matchedPersonId ? (
                    <div>
                      <strong>Matched person:</strong>{' '}
                      <Button
                        to={`/leader/contacts/${selected.matchedPersonId}`}
                        variant="secondary"
                      >
                        Open match
                      </Button>
                    </div>
                  ) : null}
                  {selected.assignedToPersonId ? (
                    <div>
                      <strong>Assigned person:</strong>{' '}
                      <Button
                        to={`/leader/contacts/${selected.assignedToPersonId}`}
                        variant="secondary"
                      >
                        Open contact
                      </Button>
                    </div>
                  ) : null}
                </div>

                <Field id="app-notes" label="Review notes">
                  <Textarea
                    id="app-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    disabled={closed || busy}
                  />
                </Field>

                <div className="btn-row">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={closed || busy}
                    onClick={() => void runAction('review')}
                  >
                    Mark reviewing
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={closed || busy}
                    onClick={() => void runAction('accept')}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={closed || busy}
                    onClick={() => void runAction('decline')}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            )}
          </Section>
        </div>
      ) : null}
    </div>
  )
}

export function ApplicationsInboxPage() {
  return (
    <RequireLeaderAccess>
      <ApplicationsInbox />
    </RequireLeaderAccess>
  )
}
