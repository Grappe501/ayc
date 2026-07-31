import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Overlay'
import { restoreContact } from '@/features/leader/leaderApi'

type Props = {
  open: boolean
  personId: string
  displayName: string
  onClose: () => void
  onRestored: () => void
}

export function RestoreContactDialog({
  open,
  personId,
  displayName,
  onClose,
  onRestored,
}: Props) {
  const [status, setStatus] = useState<'ACTIVE' | 'PROSPECTIVE' | 'INACTIVE'>('ACTIVE')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await restoreContact({ id: personId, status })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      onRestored()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={`Restore ${displayName}?`} onClose={onClose}>
      <p>This person will return to active operational views.</p>
      <form onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        <Field id="restore-status" label="Restored status">
          <Select
            id="restore-status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'ACTIVE' | 'PROSPECTIVE' | 'INACTIVE')
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="PROSPECTIVE">Prospective</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Restoring…' : 'Restore Contact'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
