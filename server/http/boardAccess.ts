import type { HandlerEvent } from '@netlify/functions'
import type { AycDatabase } from '../db/client.ts'
import {
  canAccessBoard,
  type BoardAccessTarget,
  type RoleGrant,
} from '../../shared/access/canAccessBoard.ts'
import { extractLeaderSecret, resolveKey, type UnlockScope } from './auth.ts'
import { resolvePersonSession } from './personAuth.ts'
import { listLeadershipRolesForPerson } from '../services/leadershipRoleService.ts'

const WRITE_ROLE_CODES = new Set([
  'LEAD_ORGANIZER',
  'CATEGORY_LEAD',
  'GRAPHIC_DESIGN_LEAD',
  'HS_LEAD_ORGANIZER',
  'WC_LEAD_ORGANIZER',
  'LOCATION_LEAD',
  'LOCATION_TEAM_LEAD',
])

export function roleRowsToGrants(
  rows: Array<{
    roleCode: string
    teamSlug?: string | null
    teamId?: string | null
    locationId?: string | null
    segment?: string | null
  }>,
): RoleGrant[] {
  return rows.map((row) => ({
    roleCode: row.roleCode,
    teamSlug: row.teamSlug ?? null,
    teamId: row.teamId ?? null,
    locationId: row.locationId ?? null,
    segment: row.segment ?? null,
  }))
}

export function rolesGrantLeaderWrite(roles: RoleGrant[]): boolean {
  return roles.some((role) => WRITE_ROLE_CODES.has(role.roleCode))
}

/**
 * Board / leader writes: break-glass key header, or logged-in account with leadership roles.
 * Bearer JWT is never treated as a shared key (keys use X-AYC-Leader-Write-Secret only).
 */
export async function requireBoardWriteAccess(
  db: AycDatabase,
  event: HandlerEvent,
): Promise<
  | { ok: true; mode: 'key'; scope: UnlockScope }
  | { ok: true; mode: 'account'; personId: string; roles: RoleGrant[] }
  | { ok: false; reason: 'misconfigured' | 'unauthorized' }
> {
  const keyHeader = extractLeaderSecret(event)
  if (keyHeader) {
    const match = resolveKey(keyHeader)
    if (match) return { ok: true, mode: 'key', scope: match.scope }
    // Stale/wrong break-glass key: fall through to account JWT when present.
  }

  const person = await resolvePersonSession(db, event)
  if (!person.ok) {
    if (person.reason === 'misconfigured') return { ok: false, reason: 'misconfigured' }
    return { ok: false, reason: 'unauthorized' }
  }

  const rows = await listLeadershipRolesForPerson(db, person.session.personId)
  const roles = roleRowsToGrants(rows)
  if (!rolesGrantLeaderWrite(roles)) return { ok: false, reason: 'unauthorized' }

  return { ok: true, mode: 'account', personId: person.session.personId, roles }
}

export function accountCanRevealContacts(roles: RoleGrant[]): boolean {
  return rolesGrantLeaderWrite(roles)
}

export function rolesCanAccessTarget(roles: RoleGrant[], target: BoardAccessTarget): boolean {
  return canAccessBoard(roles, target)
}
