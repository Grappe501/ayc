import { useState } from 'react'
import { Button, Field, Select, Tag } from '@/components/ui'
import {
  grantLeadershipRole,
  revokeLeadershipRole,
  type LeadershipRole,
} from '@/features/leader/leaderApi'
import { TEAMS } from '@/content/ayc'

const ROLE_LABELS: Record<string, string> = {
  LEAD_ORGANIZER: 'Lead Organizer',
  CATEGORY_LEAD: 'Category Campaign Lead',
  GRAPHIC_DESIGN_LEAD: 'Graphic Design Lead',
  HS_LEAD_ORGANIZER: 'High School Lead Organizer',
  WC_LEAD_ORGANIZER: 'Working Class Lead Organizer',
  LOCATION_LEAD: 'Location Lead Organizer',
}

function roleLabel(role: LeadershipRole): string {
  const base = ROLE_LABELS[role.roleCode] ?? role.roleCode
  if (role.teamName) return `${base} · ${role.teamName}`
  if (role.locationName) {
    return `${base} · ${role.locationCode ?? ''} ${role.locationName}`.trim()
  }
  if (role.segment) return `${base} · ${role.segment.replaceAll('_', ' ')}`
  return base
}

type Props = {
  personId: string
  roles: LeadershipRole[]
  locationId?: string | null
  canGrant: boolean
  disabled?: boolean
  onChange: (roles: LeadershipRole[]) => void
}

export function LeadershipRolesPanel({
  personId,
  roles,
  locationId,
  canGrant,
  disabled,
  onChange,
}: Props) {
  const [roleCode, setRoleCode] = useState('LOCATION_LEAD')
  const [teamSlug, setTeamSlug] = useState('organizer')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function grant() {
    setBusy(true)
    setError('')
    const result = await grantLeadershipRole({
      personId,
      roleCode,
      teamSlug: roleCode === 'CATEGORY_LEAD' ? teamSlug : null,
      locationId: roleCode === 'LOCATION_LEAD' ? locationId : null,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    onChange([...roles, result.data.role])
  }

  async function revoke(roleId: string) {
    setBusy(true)
    setError('')
    const result = await revokeLeadershipRole(roleId)
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    onChange(roles.filter((role) => role.id !== roleId))
  }

  return (
    <div className="leadership-roles-panel">
      <p className="field__hint">
        Person-linked roles for the Phase 2G scope engine. Unlock keys still open boards today;
        granted roles encode who should have access when identity hardens.
      </p>
      {roles.length === 0 ? (
        <p className="field__hint">No leadership roles granted yet.</p>
      ) : (
        <ul className="segment-people-list">
          {roles.map((role) => (
            <li key={role.id}>
              <Tag>{roleLabel(role)}</Tag>
              {canGrant && !disabled ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void revoke(role.id)}
                >
                  Revoke
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canGrant && !disabled ? (
        <div style={{ marginTop: '1rem' }}>
          <Field id="grant-role" label="Grant role">
            <Select
              id="grant-role"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
            >
              <option value="LOCATION_LEAD">Location Lead Organizer</option>
              <option value="CATEGORY_LEAD">Category Campaign Lead</option>
              <option value="GRAPHIC_DESIGN_LEAD">Graphic Design Lead</option>
              <option value="HS_LEAD_ORGANIZER">High School Lead Organizer</option>
              <option value="WC_LEAD_ORGANIZER">Working Class Lead Organizer</option>
              <option value="LEAD_ORGANIZER">Lead Organizer</option>
            </Select>
          </Field>
          {roleCode === 'CATEGORY_LEAD' ? (
            <Field id="grant-team" label="Category">
              <Select
                id="grant-team"
                value={teamSlug}
                onChange={(e) => setTeamSlug(e.target.value)}
              >
                {TEAMS.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          {roleCode === 'LOCATION_LEAD' && !locationId ? (
            <p className="field__hint">
              This contact needs a primary location before you can grant Location Lead.
            </p>
          ) : null}
          {error ? (
            <div className="error-state" role="alert">
              {error}
            </div>
          ) : null}
          <div className="btn-row">
            <Button
              type="button"
              variant="primary"
              disabled={
                busy || (roleCode === 'LOCATION_LEAD' && !locationId)
              }
              onClick={() => void grant()}
            >
              {busy ? 'Saving…' : 'Grant role'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="field__hint">Only the Lead Organizer master key can grant or revoke roles.</p>
      )}
    </div>
  )
}
