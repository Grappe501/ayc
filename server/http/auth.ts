import { timingSafeEqual } from 'node:crypto'
import type { HandlerEvent } from '@netlify/functions'

const HEADER = 'x-ayc-leader-write-secret'

export function getLeaderWriteSecret(): string | undefined {
  const secret = process.env.AYC_LEADER_WRITE_SECRET?.trim()
  return secret || undefined
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
  | { ok: true }
  | { ok: false; reason: 'misconfigured' | 'unauthorized' } {
  const expected = getLeaderWriteSecret()
  if (!expected) return { ok: false, reason: 'misconfigured' }

  const provided = extractLeaderSecret(event)
  if (!provided || !secretsMatch(provided, expected)) {
    return { ok: false, reason: 'unauthorized' }
  }
  return { ok: true }
}

export function verifyUnlockCode(code: string):
  | { ok: true }
  | { ok: false; reason: 'misconfigured' | 'unauthorized' } {
  const expected = getLeaderWriteSecret()
  if (!expected) return { ok: false, reason: 'misconfigured' }
  if (!code.trim() || !secretsMatch(code.trim(), expected)) {
    return { ok: false, reason: 'unauthorized' }
  }
  return { ok: true }
}
