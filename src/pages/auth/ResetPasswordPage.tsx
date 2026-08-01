import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, Field, Input, LoadingState, PageHeader } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { updatePassword } from '@/features/auth/authSession'
import { validateNewPassword } from '@/features/auth/passwordReset'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { ready, configured, session, refresh, me } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done || !me) return
    navigate(me.homePath || `/directory/${me.person.id}`, { replace: true })
  }, [done, me, navigate])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const invalid = validateNewPassword(password, confirm)
    if (invalid) {
      setError(invalid)
      return
    }
    if (!session) {
      setError('This reset link is missing or expired. Request a new one.')
      return
    }
    setBusy(true)
    const result = await updatePassword(password)
    if (!result.ok) {
      setBusy(false)
      setError(result.error.message)
      return
    }
    await refresh()
    setBusy(false)
    setDone(true)
  }

  if (!ready) {
    return <LoadingState label="Checking reset link…" />
  }

  return (
    <div>
      <DocumentMeta
        title="Set new password · Arkansas Youth Coalition"
        description="Choose a new password for your AYC invite account."
      />
      <PageHeader
        eyebrow="Single login"
        title="Set a new password"
        lede="Choose a new password for your AYC account. You’ll stay signed in after it saves."
        actions={
          <Button to="/login" variant="secondary">
            Log in
          </Button>
        }
      />

      {!configured ? (
        <div className="error-state" role="alert">
          Personal login is not configured on this environment yet.
        </div>
      ) : !session ? (
        <div className="card" style={{ maxWidth: '32rem' }}>
          <h2>Reset link needed</h2>
          <p>
            Open the link from your email on this device, or request a new reset. Links expire for
            security.
          </p>
          <div className="btn-row">
            <Button to="/forgot-password" variant="primary">
              Request reset link
            </Button>
            <Button to="/login" variant="secondary">
              Back to log in
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="calendar-create" style={{ maxWidth: '28rem' }}>
          <Field id="reset-password" label="New password">
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Field id="reset-confirm" label="Confirm password">
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          {error ? (
            <div className="error-state" role="alert">
              {error}
            </div>
          ) : null}
          <div className="btn-row">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save password'}
            </Button>
          </div>
          <p className="field__hint">
            Prefer to sign in instead? <Link to="/login">Log in</Link>.
          </p>
        </form>
      )}
    </div>
  )
}
