import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Overlay'
import { archiveContact } from '@/features/leader/leaderApi'

const REASONS = [
  { value: 'NO_LONGER_ACTIVE', label: 'No longer active' },
  { value: 'DUPLICATE_RECORD', label: 'Duplicate record' },
  { value: 'REQUESTED_REMOVAL', label: 'Requested removal' },
  { value: 'ENTERED_IN_ERROR', label: 'Entered in error' },
  { value: 'OTHER', label: 'Other' },
] as const

type Props = {
  open: boolean
  personId: string
  displayName: string
  onClose: () => void
  onArchived: () => void
}

export function ArchiveContactDialog({
  open,
  personId,
  displayName,
  onClose,
  onArchived,
}: Props) {
  const [reason, setReason] = useState<string>(REASONS[0].value)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await archiveContact({
        id: personId,
        reason,
        note: note.trim() || undefined,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      onArchived()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={`Archive ${displayName}?`} onClose={onClose}>
      <p>
        This person will be removed from the active directory but their history will be preserved.
      </p>
      <form onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        <Field id="archive-reason" label="Reason for archiving">
          <Select id="archive-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="archive-note" label="Optional note">
          <Input id="archive-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Archiving…' : 'Archive Contact'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
