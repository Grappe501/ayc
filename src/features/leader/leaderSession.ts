import type { UnlockScope } from './accessScope'

const SESSION_KEY = 'ayc_leader_write_secret'
const SCOPE_KEY = 'ayc_leader_scope'

export type { UnlockScope }

export function hasLeaderSession(): boolean {
  return Boolean(getLeaderWriteSecret())
}

export function getLeaderWriteSecret(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function getLeaderScope(): UnlockScope | null {
  try {
    const raw = sessionStorage.getItem(SCOPE_KEY)
    if (!raw) {
      // Backward compat: secret without scope = master (pre-hierarchy sessions).
      return getLeaderWriteSecret()
        ? { kind: 'master', label: 'Lead Organizer (master key)' }
        : null
    }
    return JSON.parse(raw) as UnlockScope
  } catch {
    return null
  }
}

export function clearLeaderSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SCOPE_KEY)
  } catch {
    /* ignore */
  }
}

export function setLeaderSession(secret: string, scope: UnlockScope): void {
  sessionStorage.setItem(SESSION_KEY, secret)
  sessionStorage.setItem(SCOPE_KEY, JSON.stringify(scope))
}
