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
    if (me) navigate(`/directory/${me.person.id}`, { replace: true })
  }, [me, navigate])

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
    navigate(params.get('next') || '/directory', { replace: true })
  }

  return (
    <div>
      <DocumentMeta
        title="Log in · Arkansas Youth Coalition"
        description="Log in to your AYC Leadership Workbench account to edit your directory profile."
      />
      <PageHeader
        eyebrow="Personal account"
        title="Log in"
        lede="Invite-only accounts. Use the email and password from your claim invite."
        actions={
          <Button to="/claim" variant="secondary">
            Claim invite
          </Button>
        }
      />

      {!configured ? (
        <div className="error-state" role="alert">
          Personal login is not configured on this environment yet.
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
