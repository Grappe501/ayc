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
  return request<{
    unlocked: boolean
    scope: {
      kind: 'master' | 'category' | 'segment'
      label: string
      teamSlug?: string
      segment?: 'high-school' | 'working-class'
    }
  }>('leader-unlock', { method: 'POST', body: JSON.stringify({ code }) }, { auth: false })
}

export function fetchLeaderSummary() {
  return request<{
    activePeople: number
    leads: number
    volunteers: number
    locationsRepresented: number
  }>('leader-summary')
}

export type TeamAttentionDigest = {
  slug: string
  name: string
  mark: string
  shortLabel: string
  roster: number
  leads: number
  volunteers: number
  locationsRepresented: number
  missingContact: number
  prospective: number
  joinForm: number
  needsPreferred: number
  textReady: number
  noLead: boolean
  openItems: number
  topIssues: string[]
}

export function fetchTeamDigests() {
  return request<{
    generatedAt: string
    totalOpenItems: number
    teamsNeedingAttention: number
    digests: TeamAttentionDigest[]
  }>('team-digests')
}

export type LeaderRosterRow = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  source: string
  preferredContactMethod: string
  textReady: boolean
  needsPreferred: boolean
  createdAt: string
  updatedAt: string
  hasEmail: boolean
  hasPhone: boolean
  missingContact: boolean
  location: { id: string; code: string; name: string; locationType: string } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
    position: string
  } | null
  additionalTeams: Array<{ id: string; name: string; slug: string; position: string }>
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
  >('contacts?view=recent')
}

export function fetchLeaderRoster(params?: {
  q?: string
  team?: string
  status?: string
  gapsOnly?: boolean
  textReadyOnly?: boolean
  needsPreferredOnly?: boolean
  preferred?: string
}) {
  const qs = new URLSearchParams()
  qs.set('view', 'roster')
  if (params?.q) qs.set('q', params.q)
  if (params?.team) qs.set('team', params.team)
  if (params?.status) qs.set('status', params.status)
  if (params?.gapsOnly) qs.set('gaps', '1')
  if (params?.textReadyOnly) qs.set('textReady', '1')
  if (params?.needsPreferredOnly) qs.set('needsPreferred', '1')
  if (params?.preferred) qs.set('preferred', params.preferred)
  return request<{
    total: number
    attention: {
      missingContact: number
      prospective: number
      joinForm: number
      needsPreferred: number
      textReady: number
    }
    people: LeaderRosterRow[]
  }>(`contacts?${qs.toString()}`)
}

export function assignTeam(body: {
  personId: string
  primaryTeamId: string
  position: 'LEAD' | 'VOLUNTEER'
  additionalTeamIds?: string[]
}) {
  return request<{ person: LeaderRosterRow | null }>('assign-team', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type LeaderFeedbackItem = {
  id: string
  referenceCode: string
  category: string
  pagePath: string | null
  workflow: string | null
  description: string
  severity: string | null
  status: string
  reporterName: string | null
  reporterContact: string | null
  browserContext: string | null
  resolutionSummary: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export function fetchLeaderFeedback(params?: { status?: string; q?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.q) qs.set('q', params.q)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return request<{
    total: number
    openCount: number
    items: LeaderFeedbackItem[]
  }>(`leader-feedback${suffix}`)
}

export function updateLeaderFeedback(body: {
  id: string
  status?: string
  severity?: string | null
  resolutionSummary?: string | null
}) {
  return request<{ item: LeaderFeedbackItem }>('leader-feedback', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
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

export type ContactDetail = {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  preferredName: string | null
  displayName: string | null
  status: string
  source: string
  preferredContactMethod: string | null
  textReady: boolean
  needsPreferred: boolean
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  email: { value: string; normalized: string; isVerified: boolean } | null
  phone: {
    value: string
    normalized: string
    isVerified: boolean
    consentStatus?: string
  } | null
  location: {
    id: string
    name: string
    code: string
    compositeCode: string
    locationType: string
    city: string | null
    countyName: string | null
    affiliationType: string
  } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
    position: string
    status: string
  } | null
  additionalTeams: Array<{
    id: string
    name: string
    slug: string
    position: string
    status: string
  }>
  recentAudit: Array<{
    id: string
    eventType: string
    changeSummary: string
    createdAt: string
  }>
}

export function createContact(body: Record<string, unknown>) {
  return request<{
    status: 'created'
    personId: string
    displayName: string
  }>('contacts', { method: 'POST', body: JSON.stringify(body) })
}

export function fetchContact(personId: string) {
  return request<ContactDetail>(`contact?id=${encodeURIComponent(personId)}`)
}

export function updateContact(personId: string, body: Record<string, unknown>) {
  return request<{
    status: 'updated'
    personId: string
    displayName: string
    contact: ContactDetail | null
  }>(`contact?id=${encodeURIComponent(personId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function archiveContact(body: {
  id: string
  reason: string
  note?: string
}) {
  return request<{ status: 'archived'; contact: ContactDetail | null }>(
    'archive-contact',
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export function restoreContact(body: { id: string; status: string }) {
  return request<{ status: 'restored'; contact: ContactDetail | null }>(
    'restore-contact',
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export function updateContactFlags(body: {
  id: string
  preferredContactMethod?: string
  textReady?: boolean
}) {
  return request<{ status: 'updated'; contact: ContactDetail | null }>('contact-flags', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export type DuplicateQueuePerson = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  source: string
  createdAt: string
  email: string | null
  phone: string | null
  location: { id: string; code: string; name: string } | null
  primaryTeam: { id: string; name: string; slug: string; position: string } | null
}

export type DuplicateQueueItem = {
  key: string
  result: 'EXACT_MATCH' | 'LIKELY_MATCH' | 'POSSIBLE_MATCH'
  reasons: string[]
  suggestedSurvivorId: string
  left: DuplicateQueuePerson
  right: DuplicateQueuePerson
}

export function fetchDuplicateQueue() {
  return request<{
    total: number
    exact: number
    likely: number
    possible: number
    items: DuplicateQueueItem[]
  }>('duplicate-queue')
}

export function mergeContacts(body: {
  survivingPersonId: string
  mergedPersonId: string
  reason?: string
}) {
  return request<{
    survivingPersonId: string
    mergedPersonId: string
    summary: string
    moved: {
      contactMethods: number
      affiliations: number
      teamAssignments: number
    }
    contact: ContactDetail | null
  }>('merge-contacts', { method: 'POST', body: JSON.stringify(body) })
}
