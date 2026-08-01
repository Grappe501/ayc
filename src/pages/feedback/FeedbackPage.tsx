import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Field, Input, PageHeader, Select, Textarea } from '@/components/ui'
import { submitBetaFeedback } from '@/features/feedback/feedbackApi'

const CATEGORIES = [
  { value: 'CONFUSING', label: 'Something is confusing' },
  { value: 'MISSING_FEATURE', label: 'Something is missing' },
  { value: 'MOBILE_PROBLEM', label: 'Something is difficult on mobile' },
  { value: 'ERROR', label: 'I found an error' },
  { value: 'IDEA', label: 'I have an idea' },
  { value: 'PRIVACY_CONCERN', label: 'I have a privacy concern' },
  { value: 'ACCESSIBILITY_PROBLEM', label: 'I found an accessibility problem' },
] as const

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home / Vision landing',
  '/join': 'Join AYC',
  '/join/thanks': 'Join confirmation',
  '/login': 'Personal login',
  '/claim': 'Claim invite',
  '/leader': 'Leader Board / Workbench',
  '/leader/gaps': 'Gap fill',
  '/leader/duplicates': 'Duplicate merge',
  '/leader/feedback': 'Feedback inbox',
  '/leader/applications': 'Join applications',
  '/leader/reports': 'Reports',
  '/leader/calendar': 'Leader calendar',
  '/leader/contacts/new': 'Add Contact',
  '/directory': 'Leadership Directory',
  '/calendar': 'Public calendar',
  '/feedback': 'Feedback',
  '/workbench': 'Leader Board / Workbench',
  '/people': 'Leadership Directory',
  '/add-contact': 'Add Contact',
}

function workflowFromPath(path: string): string {
  if (path.startsWith('/leader')) return 'leader'
  if (path.startsWith('/directory') || path === '/people') return 'directory'
  if (path.startsWith('/feedback')) return 'feedback'
  if (path === '/') return 'landing'
  return 'general'
}

function buildBrowserContext(): string {
  return JSON.stringify({
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}

export function FeedbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const fromPath = params.get('from') || '/'

  const pageOptions = useMemo(() => {
    const known = Object.entries(PAGE_LABELS).map(([value, label]) => ({ value, label }))
    if (fromPath && !PAGE_LABELS[fromPath]) {
      known.unshift({ value: fromPath, label: fromPath })
    }
    return known
  }, [fromPath])

  const [category, setCategory] = useState('')
  const [pagePath, setPagePath] = useState(fromPath || '/')
  const [description, setDescription] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterContact, setReporterContact] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [referenceCode, setReferenceCode] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setBusy(true)
    try {
      const result = await submitBetaFeedback({
        category,
        description,
        pagePath,
        workflow: workflowFromPath(pagePath),
        reporterName: reporterName || null,
        reporterContact: reporterContact || null,
        browserContext: buildBrowserContext(),
      })
      if (!result.ok) {
        if (result.error.fields) setFieldErrors(result.error.fields)
        setError(
          result.error.message === 'Please review the highlighted fields.'
            ? 'We could not submit your feedback. Your message is still on the screen. Please try again.'
            : result.error.message,
        )
        return
      }
      setReferenceCode(result.data.referenceCode)
    } catch {
      setError(
        'We could not submit your feedback. Your message is still on the screen. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  function resetForm() {
    setCategory('')
    setDescription('')
    setReporterName('')
    setReporterContact('')
    setError('')
    setFieldErrors({})
    setReferenceCode(null)
    setPagePath(fromPath || '/')
  }

  if (referenceCode) {
    return (
      <div>
        <PageHeader
          eyebrow="Feedback Received"
          title="Feedback Received"
          lede="Thank you for helping shape the AYC Workbench."
        />
        <div className="card">
          <p>
            Reference: <strong>{referenceCode}</strong>
          </p>
          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate(fromPath && fromPath !== '/feedback' ? fromPath : '/')}
            >
              Return to Previous Page
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Submit More Feedback
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Leadership Feedback"
        title="Help Build the Workbench"
        lede="Tell us what is confusing, missing, difficult, or worth improving."
      />

      <form className="card" onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}

        <Field
          id="feedback-category"
          label="What kind of feedback is this? *"
          hint={fieldErrors.category}
        >
          <Select
            id="feedback-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="feedback-where" label="Where did this happen?">
          <Select
            id="feedback-where"
            value={pagePath}
            onChange={(e) => setPagePath(e.target.value)}
          >
            {pageOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="feedback-description"
          label="Tell us what happened or what you need. *"
          hint={
            fieldErrors.description ||
            'Be as specific as you can. What were you trying to do? What happened? What would have made it easier?'
          }
        >
          <Textarea
            id="feedback-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />
        </Field>

        <Field id="feedback-name" label="Your name">
          <Input
            id="feedback-name"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            autoComplete="name"
          />
        </Field>

        <Field
          id="feedback-contact"
          label="Best way to follow up"
          hint="Optional email or phone if you want a reply."
        >
          <Input
            id="feedback-contact"
            value={reporterContact}
            onChange={(e) => setReporterContact(e.target.value)}
            autoComplete="email"
          />
        </Field>

        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit Feedback'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(fromPath && fromPath !== '/feedback' ? fromPath : '/')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
