const SESSION_KEY = 'ayc_leader_write_secret'

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

export function clearLeaderSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function setLeaderSession(secret: string): void {
  sessionStorage.setItem(SESSION_KEY, secret)
}
