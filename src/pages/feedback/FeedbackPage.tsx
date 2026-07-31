import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import '@/components/ui/ui.css'

const CATEGORIES = [
  { value: 'CONFUSING', label: 'Something is confusing' },
  { value: 'MISSING_FEATURE', label: 'Something is missing' },
  { value: 'MOBILE_PROBLEM', label: 'Something is difficult on mobile' },
  { value: 'ERROR', label: 'I found an error' },
  { value: 'IDEA', label: 'I have an idea' },
  { value: 'PRIVACY_CONCERN', label: 'I have a privacy concern' },
  { value: 'ACCESSIBILITY_PROBLEM', label: 'I found an accessibility problem' },
] as const

export function FeedbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const fromPath = params.get('from') ?? ''
  const [category, setCategory] = useState('')
  const [pagePath, setPagePath] = useState(fromPath)
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const reference = useMemo(() => {
    const n = Math.floor(Math.random() * 900000) + 100000
    return `AYC-FB-${n}`
  }, [submitted])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!category || !description.trim()) {
      setError('Please choose a feedback type and tell us what happened.')
      return
    }
    // Persistence via Netlify Function arrives in Phase 1G. Capture locally for beta UX now.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <p className="page-eyebrow">Beta Feedback</p>
        <h1>Feedback Received</h1>
        <div className="surface">
          <p>Thank you for helping shape the AYC Workbench.</p>
          <p>
            <strong>Reference: {reference}</strong>
          </p>
          <p className="field__hint">
            Server persistence ships in the beta-feedback slice. Your note is acknowledged in this
            session.
          </p>
          <div className="btn-row">
            <Button
              variant="primary"
              onClick={() => {
                if (fromPath) navigate(fromPath)
                else navigate('/')
              }}
            >
              Return to Previous Page
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false)
                setDescription('')
                setCategory('')
              }}
            >
              Submit More Feedback
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="page-eyebrow">Beta Feedback</p>
      <h1>Help Build the Workbench</h1>
      <p className="page-lede">
        Tell us what is confusing, missing, difficult, or worth improving.
      </p>
      <form className="surface form-stack" onSubmit={onSubmit} noValidate>
        {error ? (
          <div className="alert alert--on-light" role="alert">
            {error}
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="category">What kind of feedback is this?</label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select one</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pagePath">Where did this happen?</label>
          <input
            id="pagePath"
            value={pagePath}
            onChange={(e) => setPagePath(e.target.value)}
            placeholder="/leader"
          />
        </div>
        <div className="field">
          <label htmlFor="description">Tell us what happened or what you need.</label>
          <textarea
            id="description"
            required
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="field__hint">
            Be as specific as you can. What were you trying to do? What happened? What would have
            made it easier?
          </p>
        </div>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="followUp">Best way to follow up</label>
          <input id="followUp" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        </div>
        <div className="btn-row">
          <Button type="submit" variant="primary">
            Submit Feedback
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
