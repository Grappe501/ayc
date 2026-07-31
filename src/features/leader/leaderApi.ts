import { getLeaderWriteSecret } from '@/features/leader/leaderSession'

export type ApiError = {
  code: string
  message: string
  fields?: Record<string, string>
  duplicateResult?: string
  candidates?: Array<{
    id: string
    firstName: string
    lastName: string
    preferredName: string | null
    status: string
    emails: string[]
    phones: string[]
  }>
  reasons?: string[]
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError; status: number }

async function request<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean } = { auth: true },
): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (opts.auth !== false) {
    const secret = getLeaderWriteSecret()
    if (!secret) {
      return {
        ok: false,
        status: 401,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Leader write access is required.',
        },
      }
    }
    headers.set('X-AYC-Leader-Write-Secret', secret)
  }

  const response = await fetch(`/api/${path}`, { ...init, headers })
  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: T }
    | { ok: false; error: ApiError }
    | null

  if (!payload) {
    return {
      ok: false,
      status: response.status,
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected server response.' },
    }
  }

  if (!payload.ok) {
    return { ok: false, status: response.status, error: payload.error }
  }

  return { ok: true, data: payload.data }
}

export function unlockLeader(code: string) {
  return request<{ unlocked: boolean }>(
    'leader-unlock',
    { method: 'POST', body: JSON.stringify({ code }) },
    { auth: false },
  )
}

export function fetchLeaderSummary() {
  return request<{
    activePeople: number
    leads: number
    volunteers: number
    locationsRepresented: number
  }>('leader-summary')
}

export function fetchRecentContacts() {
  return request<
    Array<{
      id: string
      firstName: string
      lastName: string
      preferredName: string | null
      displayName: string | null
      status: string
      createdAt: string
    }>
  >('contacts')
}

export function fetchTeams() {
  return request<
    Array<{
      id: string
      name: string
      slug: string
      code: string
      description: string | null
      displayOrder: number
    }>
  >('teams')
}

export function fetchLocations(type?: string) {
  const qs = type ? `?type=${encodeURIComponent(type)}` : ''
  return request<
    Array<{
      id: string
      locationType: string
      code: string
      compositeCode: string
      name: string
      shortName: string | null
      city: string | null
      countyName: string | null
    }>
  >(`locations${qs}`)
}

export function createLocation(body: {
  locationType: string
  name: string
  code: string
  shortName?: string
  city?: string
  countyName?: string
}) {
  return request<{
    id: string
    locationType: string
    code: string
    compositeCode: string
    name: string
    shortName: string | null
  }>('locations', { method: 'POST', body: JSON.stringify(body) })
}

export function createContact(body: Record<string, unknown>) {
  return request<{
    status: 'created'
    personId: string
    displayName: string
  }>('contacts', { method: 'POST', body: JSON.stringify(body) })
}
