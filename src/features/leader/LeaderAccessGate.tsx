import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { setLeaderSession } from '@/features/leader/leaderSession'

type Props = {
  onUnlocked: () => void
}

/** Reserved for Phase 1D — write-access gate UI. Not used in Phase 1A shell. */
export function LeaderAccessGate({ onUnlocked }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (!code.trim()) {
        setError('That access code was not accepted. Please check it and try again.')
        return
      }
      setLeaderSession()
      onUnlocked()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="page-header__eyebrow">Leader Entry Access</p>
      <h1>Leader Entry Access</h1>
      <p className="page-header__lede">
        This area is used to create and manage AYC leadership records. Enter the leader access code
        to continue.
      </p>
      <form className="card" onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
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
