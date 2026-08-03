import { getLeaderWriteSecret } from '@/features/leader/leaderSession'
import { getAccessToken } from './authSession'

export type AuthRoleGrant = {
  roleCode: string
  teamSlug?: string | null
  teamId?: string | null
  locationId?: string | null
  segment?: string | null
}

export type AuthMe = {
  account: {
    id: string
    email: string
    accountStatus: string
    lastLoginAt: string | null
  }
  person: {
    id: string
    displayName: string
    firstName: string
    lastName: string
    preferredName: string | null
    status: string
  }
  roles: AuthRoleGrant[]
  homePath: string
  canAccessWorkbench: boolean
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { message: string; fields?: Record<string, string> } }

async function authRequest<T>(
  path: string,
  init: RequestInit = {},
  opts: { bearer?: boolean } = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (opts.bearer !== false) {
    const token = await getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(`/api/${path}`, { ...init, headers })
  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: T }
    | { ok: false; error: { message: string; fields?: Record<string, string> } }
    | null
  if (!payload) {
    return { ok: false, error: { message: 'Unexpected server response.' } }
  }
  if (!payload.ok) return { ok: false, error: payload.error }
  return { ok: true, data: payload.data }
}

export function claimAccount(body: { email: string; code: string; password: string }) {
  return authRequest<{
    account: { id: string; personId: string; email: string }
    session: {
      accessToken: string
      refreshToken: string
      expiresAt: number | null
    } | null
    message: string
  }>('account-claim', { method: 'POST', body: JSON.stringify(body) }, { bearer: false })
}

export function fetchMe() {
  return authRequest<AuthMe>('account-me')
}

export function bindOAuthAccount() {
  return authRequest<{
    bound: 'existing' | 'rebound' | 'claimed'
    account: { id: string; personId: string; email: string }
  }>('account-oauth-bind', { method: 'POST' })
}

export async function inviteAccount(personId: string, email?: string | null) {
  const secret = getLeaderWriteSecret()
  const headers: Record<string, string> = {}
  if (secret) headers['X-AYC-Leader-Write-Secret'] = secret
  return authRequest<{
    inviteId: string
    personId: string
    email: string
    code: string
    expiresAt: string
    claimPath: string
  }>('account-invite', {
    method: 'POST',
    body: JSON.stringify({ personId, email }),
    headers,
  })
}
