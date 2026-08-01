import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { unlockLeader } from '@/features/leader/leaderApi'
import { setLeaderSession, type UnlockScope } from '@/features/leader/leaderSession'

type Props = {
  onUnlocked: (scope: UnlockScope) => void
  /** Present as emergency break-glass rather than primary unlock. */
  breakGlass?: boolean
}

export function LeaderAccessGate({ onUnlocked, breakGlass = false }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(!breakGlass)

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

  if (breakGlass && !open) {
    return (
      <div className="card">
        <p className="field__hint" style={{ marginBottom: '0.75rem' }}>
          Emergency only — if account login is unavailable, use a shared board key.
        </p>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Use emergency board key
        </Button>
      </div>
    )
  }

  return (
    <div>
      {breakGlass ? (
        <>
          <p className="page-header__eyebrow">Break-glass</p>
          <h2>Emergency board key</h2>
          <p className="page-header__lede">
            Shared keys are for bootstrap and emergencies. Prefer logging in with your granted
            account whenever possible.
          </p>
        </>
      ) : (
        <>
          <p className="page-header__eyebrow">Leadership Access</p>
          <h1>Board access code</h1>
          <p className="page-header__lede">
            Enter your leadership key. The Lead Organizer master key opens every board.
          </p>
        </>
      )}
      <form className="card" onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        <Field id="leader-code" label="Emergency board key">
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
            {busy ? 'Unlocking…' : 'Unlock with key'}
          </Button>
          {breakGlass ? (
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          ) : (
            <Button to="/" variant="secondary">
              Back to home
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
