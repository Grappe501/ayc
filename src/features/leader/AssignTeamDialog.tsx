import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Overlay'
import { assignTeam, fetchTeams, type LeaderRosterRow } from '@/features/leader/leaderApi'

type TeamOption = { id: string; name: string; slug: string }

type Props = {
  open: boolean
  person: LeaderRosterRow | null
  /** Prefill primary team when person has none (e.g. from a Team Lead Board). */
  defaultTeamId?: string
  onClose: () => void
  onAssigned: (row: LeaderRosterRow) => void
}

export function AssignTeamDialog({
  open,
  person,
  defaultTeamId,
  onClose,
  onAssigned,
}: Props) {
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [primaryTeamId, setPrimaryTeamId] = useState('')
  const [position, setPosition] = useState<'LEAD' | 'VOLUNTEER'>('VOLUNTEER')
  const [additionalTeamIds, setAdditionalTeamIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    void fetchTeams().then((result) => {
      if (result.ok) setTeams(result.data)
    })
  }, [open])

  useEffect(() => {
    if (!open || !person) return
    setPrimaryTeamId(person.primaryTeam?.id ?? defaultTeamId ?? '')
    setPosition(person.primaryTeam?.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER')
    setAdditionalTeamIds(person.additionalTeams.map((t) => t.id))
    setError('')
  }, [open, person, defaultTeamId])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!person || !primaryTeamId) {
      setError('Choose a primary team.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await assignTeam({
        personId: person.id,
        primaryTeamId,
        position,
        additionalTeamIds,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      if (result.data.person) onAssigned(result.data.person)
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title={person ? `Assign teams — ${person.displayName}` : 'Assign teams'}
      onClose={onClose}
    >
      <p className="field__hint">
        Set the primary team and optional additional teams for Chance Bradford’s contact list.
      </p>
      <form onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        <Field id="assign-primary" label="Primary team *">
          <Select
            id="assign-primary"
            value={primaryTeamId}
            onChange={(e) => {
              setPrimaryTeamId(e.target.value)
              setAdditionalTeamIds((ids) => ids.filter((id) => id !== e.target.value))
            }}
            required
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="assign-position" label="Position *">
          <Select
            id="assign-position"
            value={position}
            onChange={(e) => setPosition(e.target.value as 'LEAD' | 'VOLUNTEER')}
          >
            <option value="LEAD">Lead</option>
            <option value="VOLUNTEER">Volunteer</option>
          </Select>
        </Field>
        <fieldset className="field">
          <legend>Additional teams</legend>
          {teams
            .filter((team) => team.id !== primaryTeamId)
            .map((team) => (
              <label key={team.id} style={{ display: 'block', marginBottom: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={additionalTeamIds.includes(team.id)}
                  onChange={(e) => {
                    setAdditionalTeamIds((ids) =>
                      e.target.checked
                        ? [...ids, team.id]
                        : ids.filter((id) => id !== team.id),
                    )
                  }}
                />{' '}
                {team.name}
              </label>
            ))}
        </fieldset>
        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save Team Assignment'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
