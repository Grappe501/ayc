import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, Field, Input, PageHeader } from '@/components/ui'
import { claimAccount } from '@/features/auth/authApi'
import { useAuth } from '@/features/auth/AuthProvider'
import { setSessionFromTokens } from '@/features/auth/authSession'

export function ClaimPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { refresh } = useAuth()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState(params.get('code') ?? '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    const result = await claimAccount({
      email: email.trim(),
      code: code.trim(),
      password,
    })
    if (!result.ok) {
      setBusy(false)
      setError(result.error.message)
      return
    }
    if (result.data.session) {
      await setSessionFromTokens(
        result.data.session.accessToken,
        result.data.session.refreshToken,
      )
      await refresh()
      setBusy(false)
      navigate(`/directory/${result.data.account.personId}`, { replace: true })
      return
    }
    setBusy(false)
    navigate(`/login?email=${encodeURIComponent(result.data.account.email)}`, {
      replace: true,
    })
  }

  return (
    <div>
      <DocumentMeta
        title="Claim invite · Arkansas Youth Coalition"
        description="Claim your AYC account invite and set a password."
      />
      <PageHeader
        eyebrow="Personal account"
        title="Claim your invite"
        lede="Enter the email and one-time code from your leader, then choose a password."
        actions={
          <Button to="/login" variant="secondary">
            Already claimed? Log in
          </Button>
        }
      />

      <form onSubmit={onSubmit} className="calendar-create" style={{ maxWidth: '28rem' }}>
        <Field id="claim-email" label="Email">
          <Input
            id="claim-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field id="claim-code" label="Invite code">
          <Input
            id="claim-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoComplete="one-time-code"
          />
        </Field>
        <Field id="claim-password" label="Password">
          <Input
            id="claim-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <Field id="claim-confirm" label="Confirm password">
          <Input
            id="claim-confirm"
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
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </div>
        <p className="field__hint">
          Already have an account? <Link to="/login">Log in</Link>.
        </p>
      </form>
    </div>
  )
}
