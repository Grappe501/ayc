import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, Field, Input, PageHeader } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { requestPasswordReset } from '@/features/auth/authSession'

export function ForgotPasswordPage() {
  const { configured } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const result = await requestPasswordReset(email.trim())
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setSent(true)
  }

  return (
    <div>
      <DocumentMeta
        title="Reset password · Arkansas Youth Coalition"
        description="Request a password reset link for your AYC invite account."
      />
      <PageHeader
        eyebrow="Single login"
        title="Forgot password"
        lede="Enter the email on your invite account. If it matches a claimed account, we’ll send a reset link."
        actions={
          <Button to="/login" variant="secondary">
            Back to log in
          </Button>
        }
      />

      {!configured ? (
        <div className="error-state" role="alert">
          Personal login is not configured on this environment yet. Use an emergency board key on
          the <Link to="/leader">Workbench</Link> if you need access now.
        </div>
      ) : sent ? (
        <div className="card" style={{ maxWidth: '32rem' }}>
          <h2>Check your email</h2>
          <p>
            If an AYC account exists for that address, a reset link is on the way. The link opens
            the set-new-password page on this site.
          </p>
          <div className="btn-row">
            <Button to="/login" variant="primary">
              Return to log in
            </Button>
            <Button type="button" variant="secondary" onClick={() => setSent(false)}>
              Try another email
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="calendar-create" style={{ maxWidth: '28rem' }}>
          <Field id="forgot-email" label="Email">
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          {error ? (
            <div className="error-state" role="alert">
              {error}
            </div>
          ) : null}
          <div className="btn-row">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
          </div>
          <p className="field__hint">
            Still need an account? Ask a leader to invite you, then{' '}
            <Link to="/claim">claim your invite</Link>.
          </p>
        </form>
      )}
    </div>
  )
}
