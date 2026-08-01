import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  fetchLeaderFeedback,
  updateLeaderFeedback,
  type LeaderFeedbackItem,
} from '@/features/leader/leaderApi'
import './leader-board.css'
import './feedback-inbox.css'

const STATUSES = [
  'NEW',
  'REVIEWING',
  'PLANNED',
  'IN_PROGRESS',
  'RESOLVED',
  'DECLINED',
  'DUPLICATE',
] as const

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'BLOCKING'] as const

const CATEGORY_LABELS: Record<string, string> = {
  CONFUSING: 'Confusing',
  MISSING_FEATURE: 'Missing feature',
  MOBILE_PROBLEM: 'Mobile problem',
  ERROR: 'Error',
  IDEA: 'Idea',
  PRIVACY_CONCERN: 'Privacy concern',
  ACCESSIBILITY_PROBLEM: 'Accessibility',
}

function labelStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function FeedbackInbox() {
  const [items, setItems] = useState<LeaderFeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [openCount, setOpenCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchDraft, setSearchDraft] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState('NEW')
  const [severity, setSeverity] = useState('')
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
      const result = await fetchLeaderFeedback({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        q: q || undefined,
      })
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      setItems(result.data.items)
      setTotal(result.data.total)
      setOpenCount(result.data.openCount)
      setLoading(false)
      if (result.data.items.length === 0) {
        setSelectedId(null)
        preferSelectedIdRef.current = null
        return
      }
      const preferred = preferSelectedIdRef.current
      preferSelectedIdRef.current = null
      setSelectedId((current) => {
        const next = preferred ?? current
        if (next && result.data.items.some((item) => item.id === next)) return next
        return result.data.items[0]!.id
      })
    })()
    return () => {
      cancelled = true
    }
  }, [statusFilter, q, reloadToken])

  const selected = items.find((item) => item.id === selectedId) ?? null

  useEffect(() => {
    if (!selected) return
    setStatus(selected.status)
    setSeverity(selected.severity ?? '')
    setNotes(selected.resolutionSummary ?? '')
  }, [selected])

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setBusy(true)
    setError('')
    setToast('')
    try {
      const result = await updateLeaderFeedback({
        id: selected.id,
        status,
        severity: severity || null,
        resolutionSummary: notes,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      const updated = result.data.item
      setToast(`Saved ${updated.referenceCode}`)
      preferSelectedIdRef.current =
        statusFilter !== 'ALL' && updated.status !== statusFilter ? null : updated.id
      setReloadToken((n) => n + 1)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Feedback Inbox"
        title="Beta Feedback Inbox"
        lede="Chance Bradford’s triage board for leadership beta feedback — update status, severity, and notes."
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Leader Board
            </Button>
            <Button to="/feedback" variant="secondary">
              Public feedback form
            </Button>
          </>
        }
      />

      <div className="card-grid card-grid--3 section">
        <StatCard value={String(openCount)} label="Open items" />
        <StatCard value={String(total)} label="All feedback" />
        <StatCard value={String(items.length)} label="Showing" />
      </div>

      <div className="leader-board-filters leader-board-filters--team">
        <Field id="fb-q" label="Search">
          <Input
            id="fb-q"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Reference, description, page…"
          />
        </Field>
        <Field id="fb-status" label="Status">
          <Select
            id="fb-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {labelStatus(value)}
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

      {loading ? <LoadingState label="Loading feedback…" /> : null}

      {!loading && items.length === 0 ? (
        <Section id="empty" title="Inbox">
          <Card>
            <Tag>Empty</Tag>
            <h3>No feedback matches these filters.</h3>
            <p>Clear filters or wait for the next beta submission.</p>
          </Card>
        </Section>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="feedback-inbox">
          <Section id="list" title="Inbox">
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
                      <strong>{item.referenceCode}</strong>
                      <span>{labelStatus(item.status)}</span>
                    </div>
                    <p>{CATEGORY_LABELS[item.category] ?? item.category}</p>
                    <p className="feedback-inbox__snippet">{item.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="detail" title="Review">
            {selected ? (
              <Card>
                <Tag>{labelStatus(selected.status)}</Tag>
                <h3>{selected.referenceCode}</h3>
                <p>
                  {CATEGORY_LABELS[selected.category] ?? selected.category}
                  {selected.severity ? ` · ${labelStatus(selected.severity)}` : ''}
                </p>
                <p className="field__hint">
                  {selected.pagePath || 'No page path'}
                  {selected.workflow ? ` · ${selected.workflow}` : ''}
                  {' · '}
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
                <div className="feedback-inbox__description">{selected.description}</div>
                {(selected.reporterName || selected.reporterContact) && (
                  <p className="field__hint">
                    Reporter: {[selected.reporterName, selected.reporterContact]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                <form className="feedback-inbox__form" onSubmit={onSave}>
                  <Field id="fb-item-status" label="Status">
                    <Select
                      id="fb-item-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {labelStatus(value)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="fb-item-severity" label="Severity">
                    <Select
                      id="fb-item-severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="">Not set</option>
                      {SEVERITIES.map((value) => (
                        <option key={value} value={value}>
                          {labelStatus(value)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="fb-notes" label="Notes / resolution">
                    <Textarea
                      id="fb-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="What we learned, what we’ll build next, or why we declined."
                    />
                  </Field>
                  <div className="btn-row">
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? 'Saving…' : 'Save review'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <p className="field__hint">Select a feedback item to review.</p>
            )}
          </Section>
        </div>
      ) : null}
    </div>
  )
}

export function FeedbackInboxPage() {
  return (
    <RequireLeaderAccess>
      <FeedbackInbox />
    </RequireLeaderAccess>
  )
}
