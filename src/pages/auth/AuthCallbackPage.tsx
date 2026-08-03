import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, LoadingState, PageHeader } from '@/components/ui'
import { bindOAuthAccount } from '@/features/auth/authApi'
import { useAuth } from '@/features/auth/AuthProvider'
import { signOut } from '@/features/auth/authSession'

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { ready, session, refresh, me } = useAuth()
  const [error, setError] = useState('')
  const bindStarted = useRef(false)

  useEffect(() => {
    if (!ready || session || error) return
    const timer = window.setTimeout(() => {
      setError(
        'Google sign-in did not complete. Try again from the login page, or claim your invite with email.',
      )
    }, 10_000)
    return () => window.clearTimeout(timer)
  }, [ready, session, error])

  useEffect(() => {
    if (!ready || !session || error || bindStarted.current) return
    bindStarted.current = true

    let cancelled = false
    ;(async () => {
      const result = await bindOAuthAccount()
      if (cancelled) return
      if (!result.ok) {
        await signOut()
        await refresh()
        setError(result.error.message)
        return
      }
      await refresh()
    })()

    return () => {
      cancelled = true
    }
  }, [ready, session, error, refresh])

  useEffect(() => {
    if (!me || error) return
    const next = safeNext(params.get('next'))
    navigate(next || me.homePath || `/directory/${me.person.id}`, { replace: true })
  }, [me, error, navigate, params])

  return (
    <div>
      <DocumentMeta
        title="Signing in · Arkansas Youth Coalition"
        description="Finishing Google sign-in for your AYC invite account."
      />
      <PageHeader
        eyebrow="Single login"
        title="Finishing Google sign-in"
        lede="Checking that this Google account matches an AYC invite."
      />

      {error ? (
        <div className="card" style={{ maxWidth: '32rem' }}>
          <div className="error-state" role="alert">
            {error}
          </div>
          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <Button to="/login" variant="primary">
              Back to log in
            </Button>
            <Button to="/claim" variant="secondary">
              Claim invite
            </Button>
          </div>
          <p className="field__hint" style={{ marginTop: '1rem' }}>
            Google is invite-only — the email must match a claimed account or an open invite.{' '}
            <Link to="/">Home</Link>
          </p>
        </div>
      ) : (
        <LoadingState label="Linking your invite account…" />
      )}
    </div>
  )
}
