import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, Field, Input, PageHeader } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { signInWithPassword } from '@/features/auth/authSession'

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { configured, refresh, me } = useAuth()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!me) return
    const next = params.get('next')
    if (next) {
      navigate(next, { replace: true })
      return
    }
    navigate(me.homePath || `/directory/${me.person.id}`, { replace: true })
  }, [me, navigate, params])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const result = await signInWithPassword(email.trim(), password)
    if (!result.ok) {
      setBusy(false)
      setError(result.error.message)
      return
    }
    await refresh()
    setBusy(false)
    // Navigation handled by me effect after refresh.
  }

  return (
    <div>
      <DocumentMeta
        title="Log in · Arkansas Youth Coalition"
        description="Log in to the AYC Leadership Workbench with your invite account."
      />
      <PageHeader
        eyebrow="Single login"
        title="Log in"
        lede="Invite-only accounts. Log in to open your directory profile and any workbench boards you’ve been granted."
        actions={
          <Button to="/claim" variant="secondary">
            Claim invite
          </Button>
        }
      />

      <p className="field__hint" style={{ marginBottom: '1rem', maxWidth: '36rem' }}>
        Board access comes from your leadership roles. Shared keys are emergency break-glass only
        — use them from the Workbench if account login is unavailable.
      </p>

      {!configured ? (
        <div className="error-state" role="alert">
          Personal login is not configured on this environment yet. You can still browse the{' '}
          <Link to="/directory">Directory</Link> and use an emergency board key on the{' '}
          <Link to="/leader">Workbench</Link>.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="calendar-create" style={{ maxWidth: '28rem' }}>
          <Field id="login-email" label="Email">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field id="login-password" label="Password">
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {busy ? 'Signing in…' : 'Log in'}
            </Button>
          </div>
          <p className="field__hint">
            Need an account? Ask a leader to invite you, then{' '}
            <Link to="/claim">claim your invite</Link>.
          </p>
        </form>
      )}
    </div>
  )
}
