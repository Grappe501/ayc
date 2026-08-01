import { timingSafeEqual } from 'node:crypto'
import type { HandlerEvent } from '@netlify/functions'
import {
  scopeCanAccessLocationCategoryBoard as lawLocationCategory,
  scopeCanAccessLocationTeamBoard as lawLocationTeam,
  scopeCanAccessSegmentBoard as lawSegment,
  scopeCanAccessStatewideLeaderBoard as lawStatewide,
  scopeCanAccessTeamBoard as lawTeamBoard,
  type UnlockScopeLike,
} from '../../shared/access/canAccessBoard.ts'

const HEADER = 'x-ayc-leader-write-secret'

export type UnlockScope =
  | { kind: 'master'; label: string }
  | { kind: 'category'; teamSlug: string; label: string }
  | { kind: 'segment'; segment: 'high-school' | 'working-class'; label: string }

type RegisteredKey = {
  secret: string
  scope: UnlockScope
}

function env(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value || undefined
}

/** Master key unlocks every board. AYC_MASTER_KEY preferred; AYC_LEADER_WRITE_SECRET kept as alias. */
export function getMasterKey(): string | undefined {
  return env('AYC_MASTER_KEY') || env('AYC_LEADER_WRITE_SECRET')
}

/** @deprecated Prefer getMasterKey / listRegisteredKeys — kept for callers that only need “a” secret. */
export function getLeaderWriteSecret(): string | undefined {
  return getMasterKey()
}

export function listRegisteredKeys(): RegisteredKey[] {
  const keys: RegisteredKey[] = []
  const master = getMasterKey()
  if (master) {
    keys.push({
      secret: master,
      scope: { kind: 'master', label: 'Lead Organizer (master key)' },
    })
  }

  const categories: Array<{ env: string; teamSlug: string; label: string }> = [
    { env: 'AYC_KEY_ORGANIZER', teamSlug: 'organizer', label: 'Organizer Campaign Lead' },
    {
      env: 'AYC_KEY_VOTER_REGISTRATION',
      teamSlug: 'voter-registration',
      label: 'Voter Registration Campaign Lead',
    },
    { env: 'AYC_KEY_SOCIAL_MEDIA', teamSlug: 'social-media', label: 'Social Media Campaign Lead' },
    {
      env: 'AYC_KEY_GRAPHIC_DESIGN',
      teamSlug: 'graphic-design',
      label: 'Graphic Design Lead',
    },
    { env: 'AYC_KEY_EVENTS', teamSlug: 'events', label: 'Events Campaign Lead' },
    { env: 'AYC_KEY_OUTREACH', teamSlug: 'outreach', label: 'Outreach Campaign Lead' },
  ]

  for (const entry of categories) {
    const secret = env(entry.env)
    if (!secret) continue
    if (master && secretsMatch(secret, master)) continue
    keys.push({
      secret,
      scope: {
        kind: 'category',
        teamSlug: entry.teamSlug,
        label: entry.label,
      },
    })
  }

  const segments: Array<{
    env: string
    segment: 'high-school' | 'working-class'
    label: string
  }> = [
    {
      env: 'AYC_KEY_HIGH_SCHOOL',
      segment: 'high-school',
      label: 'High School Lead Organizer',
    },
    {
      env: 'AYC_KEY_WORKING_CLASS',
      segment: 'working-class',
      label: 'Working Class Lead Organizer',
    },
  ]

  for (const entry of segments) {
    const secret = env(entry.env)
    if (!secret) continue
    if (master && secretsMatch(secret, master)) continue
    keys.push({
      secret,
      scope: {
        kind: 'segment',
        segment: entry.segment,
        label: entry.label,
      },
    })
  }

  return keys
}

export function resolveKey(provided: string): RegisteredKey | null {
  const trimmed = provided.trim()
  if (!trimmed) return null
  for (const key of listRegisteredKeys()) {
    if (secretsMatch(trimmed, key.secret)) return key
  }
  return null
}

export function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function extractLeaderSecret(event: HandlerEvent): string | undefined {
  const header = event.headers[HEADER] ?? event.headers[HEADER.toUpperCase()]
  if (typeof header === 'string' && header.trim()) return header.trim()

  const auth = event.headers.authorization ?? event.headers.Authorization
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim()
    return token || undefined
  }
  return undefined
}

export function requireLeaderWriteAccess(event: HandlerEvent):
  | { ok: true; scope: UnlockScope }
  | { ok: false; reason: 'misconfigured' | 'unauthorized' } {
  const keys = listRegisteredKeys()
  if (keys.length === 0) return { ok: false, reason: 'misconfigured' }

  const provided = extractLeaderSecret(event)
  if (!provided) return { ok: false, reason: 'unauthorized' }

  const match = resolveKey(provided)
  if (!match) return { ok: false, reason: 'unauthorized' }
  return { ok: true, scope: match.scope }
}

export function verifyUnlockCode(code: string):
  | { ok: true; scope: UnlockScope }
  | { ok: false; reason: 'misconfigured' | 'unauthorized' } {
  const keys = listRegisteredKeys()
  if (keys.length === 0) return { ok: false, reason: 'misconfigured' }

  const match = resolveKey(code)
  if (!match) return { ok: false, reason: 'unauthorized' }
  return { ok: true, scope: match.scope }
}

function asLawScope(scope: UnlockScope): UnlockScopeLike {
  return scope
}

/** Phase 2G — key scope checks go through canAccessBoard product law. */
export function scopeCanAccessTeamBoard(scope: UnlockScope, teamSlug: string): boolean {
  return lawTeamBoard(asLawScope(scope), teamSlug)
}

export function scopeCanAccessStatewideLeaderBoard(scope: UnlockScope): boolean {
  return lawStatewide(asLawScope(scope))
}

export function scopeCanAccessSegmentBoard(
  scope: UnlockScope,
  segment: 'high-school' | 'working-class',
): boolean {
  return lawSegment(asLawScope(scope), segment)
}

export function scopeCanAccessLocationTeamBoard(
  scope: UnlockScope,
  locationType: string,
  locationId?: string,
): boolean {
  return lawLocationTeam(asLawScope(scope), locationType, locationId)
}

export function scopeCanAccessLocationCategoryBoard(
  scope: UnlockScope,
  teamSlug: string,
  locationId?: string,
): boolean {
  return lawLocationCategory(asLawScope(scope), teamSlug, locationId)
}
