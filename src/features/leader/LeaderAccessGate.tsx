import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import '@/components/ui/ui.css'

const SESSION_KEY = 'ayc_leader_write_session'

export function hasLeaderSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function clearLeaderSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

type Props = {
  onUnlocked: () => void
}

export function LeaderAccessGate({ onUnlocked }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      // Phase 1D will validate against AYC_LEADER_WRITE_SECRET via Netlify Function.
      // Until then, accept any non-empty local unlock for UI development only.
      if (!code.trim()) {
        setError('That access code was not accepted. Please check it and try again.')
        return
      }
      sessionStorage.setItem(SESSION_KEY, '1')
      onUnlocked()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="page-eyebrow">Leader Entry Access</p>
      <h1>Leader Entry Access</h1>
      <p className="page-lede">
        This area is used to create and manage AYC leadership records. Enter the leader access code
        to continue.
      </p>
      <form className="surface form-stack" onSubmit={onSubmit}>
        {error ? (
          <div className="alert alert--on-light" role="alert">
            {error}
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="leader-code">Leader access code</label>
          <input
            id="leader-code"
            type="password"
            autoComplete="current-password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Unlocking…' : 'Unlock Leader Board'}
          </Button>
          <Button to="/directory" variant="secondary">
            Return to Directory
          </Button>
        </div>
      </form>
    </div>
  )
}
