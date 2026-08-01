import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { unlockLeader } from '@/features/leader/leaderApi'
import { setLeaderSession, type UnlockScope } from '@/features/leader/leaderSession'

type Props = {
  onUnlocked: (scope: UnlockScope) => void
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
      if (!code.trim()) {
        setError('That access code was not accepted. Please check it and try again.')
        return
      }
      const result = await unlockLeader(code.trim())
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      const scope = result.data.scope as UnlockScope
      setLeaderSession(code.trim(), scope)
      onUnlocked(scope)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="page-header__eyebrow">Leadership Access</p>
      <h1>Board access code</h1>
      <p className="page-header__lede">
        Enter your leadership key. The Lead Organizer master key opens every board. Category keys
        open their statewide board (Social Media also opens Graphic Design). An optional Graphic
        Design key lands on the GD board. High School and Working Class keys open their segment
        shells.
      </p>
      <form className="card" onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        <Field id="leader-code" label="Leadership access code">
          <Input
            id="leader-code"
            type="password"
            autoComplete="current-password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Unlocking…' : 'Unlock board'}
          </Button>
          <Button to="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </form>
    </div>
  )
}
