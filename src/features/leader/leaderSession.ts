const SESSION_KEY = 'ayc_leader_write_session'

export function hasLeaderSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function clearLeaderSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function setLeaderSession(): void {
  sessionStorage.setItem(SESSION_KEY, '1')
}
