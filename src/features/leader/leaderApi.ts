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

export type TeamTask = {
  id: string
  teamId: string
  teamSlug: string
  title: string
  notes: string | null
  status: string
  priority: string
  dueOn: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export function fetchTeamTasks(teamSlug: string) {
  return request<{
    team: { id: string; slug: string; name: string }
    openCount: number
    highCount: number
    tasks: TeamTask[]
  }>(`team-tasks?team=${encodeURIComponent(teamSlug)}`)
}

export function createTeamTask(body: {
  team: string
  title: string
  notes?: string | null
  priority?: string
  dueOn?: string | null
  status?: string
}) {
  return request<{ status: 'created'; task: TeamTask }>('team-tasks', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateTeamTask(body: {
  id: string
  title?: string
  notes?: string | null
  priority?: string
  dueOn?: string | null
  status?: string
}) {
  return request<{ status: 'updated'; task: TeamTask }>('team-tasks', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export type TeamResource = {
  id: string
  teamId: string
  teamSlug: string
  title: string
  url: string | null
  notes: string | null
  kind: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function fetchTeamResources(teamSlug: string) {
  return request<{
    team: { id: string; slug: string; name: string }
    total: number
    resources: TeamResource[]
  }>(`team-resources?team=${encodeURIComponent(teamSlug)}`)
}

export function createTeamResource(body: {
  team: string
  title: string
  url?: string | null
  notes?: string | null
  kind?: string
}) {
  return request<{ status: 'created'; resource: TeamResource }>('team-resources', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateTeamResource(body: {
  id: string
  title?: string
  url?: string | null
  notes?: string | null
  kind?: string
  archive?: boolean
}) {
  return request<{ status: 'updated' | 'archived'; resource: TeamResource }>(
    'team-resources',
    { method: 'PATCH', body: JSON.stringify(body) },
  )
}

export function setPipelineTags(body: { personId: string; tags: string[] }) {
  return request<{ tags: string[]; contact: ContactDetail | null }>('pipeline-tags', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
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
  pipelineTags: string[]
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
  locationId?: string
  locationType?: string
  status?: string
  gapsOnly?: boolean
  textReadyOnly?: boolean
  needsPreferredOnly?: boolean
  preferred?: string
  pipelineTag?: string
}) {
  const qs = new URLSearchParams()
  qs.set('view', 'roster')
  if (params?.q) qs.set('q', params.q)
  if (params?.team) qs.set('team', params.team)
  if (params?.locationId) qs.set('locationId', params.locationId)
  if (params?.locationType) qs.set('locationType', params.locationType)
  if (params?.status) qs.set('status', params.status)
  if (params?.gapsOnly) qs.set('gaps', '1')
  if (params?.textReadyOnly) qs.set('textReady', '1')
  if (params?.needsPreferredOnly) qs.set('needsPreferred', '1')
  if (params?.preferred) qs.set('preferred', params.preferred)
  if (params?.pipelineTag) qs.set('pipelineTag', params.pipelineTag)
  return request<{
    total: number
    attention: {
      missingContact: number
      prospective: number
      joinForm: number
      needsPreferred: number
      textReady: number
      readyToLead: number
      needsMentoring: number
      futureLeader: number
      localLeadCandidate: number
      categoryLeadCandidate: number
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

export type LeaderLocation = {
  id: string
  locationType: string
  code: string
  compositeCode: string
  name: string
  shortName: string | null
  city: string | null
  countyName: string | null
}

export function fetchLocations(type?: string) {
  const qs = type ? `?type=${encodeURIComponent(type)}` : ''
  return request<LeaderLocation[]>(`locations${qs}`)
}

export function fetchLocation(locationId: string) {
  return request<LeaderLocation>(`locations?id=${encodeURIComponent(locationId)}`)
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
  pipelineTags: string[]
  leadershipRoles: LeadershipRole[]
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

export type LeadershipRole = {
  id: string
  roleCode: string
  teamSlug: string | null
  teamName: string | null
  locationId: string | null
  locationName: string | null
  locationCode: string | null
  segment: string | null
  isPrimary: boolean
  grantedAt: string
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

export function grantLeadershipRole(body: {
  personId: string
  roleCode: string
  teamSlug?: string | null
  locationId?: string | null
  segment?: string | null
  isPrimary?: boolean
}) {
  return request<{ status: 'granted'; role: LeadershipRole }>('leadership-roles', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function revokeLeadershipRole(roleId: string) {
  return request<{ id: string; status: 'revoked' }>('leadership-roles', {
    method: 'PATCH',
    body: JSON.stringify({ id: roleId }),
  })
}

export type MembershipApplicationItem = {
  id: string
  referenceCode: string
  status: string
  firstName: string
  lastName: string
  preferredName: string | null
  email: string
  phone: string | null
  city: string | null
  county: string | null
  ageConfirmed: boolean
  locationInterestType: string
  locationNameFreeform: string | null
  primaryTeamInterest: string
  secondaryInterests: string[]
  wantsToLeadLocal: boolean
  wantsCategoryLead: boolean
  experienceNotes: string | null
  availabilityNotes: string | null
  howHeard: string | null
  reviewNotes: string | null
  matchedPersonId: string | null
  assignedToPersonId: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export function fetchLeaderApplications(params: { status?: string; q?: string } = {}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.q) search.set('q', params.q)
  const qs = search.toString()
  return request<{
    total: number
    openCount: number
    items: MembershipApplicationItem[]
  }>(`leader-applications${qs ? `?${qs}` : ''}`)
}

export function updateLeaderApplication(body: {
  id: string
  action: 'review' | 'accept' | 'decline'
  reviewNotes?: string | null
}) {
  return request<{
    application: MembershipApplicationItem
    personId?: string
    created?: boolean
  }>('leader-applications', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export type LeaderReportsPayload = {
  generatedAt: string
  summary: {
    activePeople: number
    leads: number
    volunteers: number
    locationsRepresented: number
    locationsWithPeople: number
    openApplications: number
    thinLocations: number
    teamsWithoutLead: number
    totalOpenTeamItems: number
  }
  applicationPipeline: {
    NEW: number
    REVIEWING: number
    ACCEPTED: number
    DECLINED: number
    DUPLICATE: number
    total: number
    open: number
  }
  recentApplications: Array<{
    id: string
    referenceCode: string
    status: string
    firstName: string
    lastName: string
    email: string
    primaryTeamInterest: string
    locationInterestType: string
    wantsToLeadLocal: boolean
    wantsCategoryLead: boolean
    createdAt: string
    assignedToPersonId: string | null
  }>
  recentJoinPeople: Array<{
    id: string
    firstName: string
    lastName: string
    preferredName: string | null
    displayName: string
    status: string
    source: string
    createdAt: string
  }>
  recentAssignments: Array<{
    id: string
    personId: string
    displayName: string
    position: string
    teamName: string
    teamSlug: string
    createdAt: string
  }>
  attention: {
    missingContact: number
    prospective: number
    joinForm: number
    needsPreferred: number
    textReady: number
    readyToLead: number
    needsMentoring: number
    futureLeader: number
    localLeadCandidate: number
    categoryLeadCandidate: number
  }
  teamCoverage: {
    teamsNeedingAttention: number
    totalOpenItems: number
    digests: Array<{
      slug: string
      name: string
      mark: string
      roster: number
      leads: number
      noLead: boolean
      openItems: number
      topIssues: string[]
      prospective: number
      joinForm: number
      missingContact: number
    }>
    thinCategoryTeams: string[]
  }
  locationCoverage: {
    totalLocations: number
    thinCount: number
    thinBySegment: {
      highSchool: number
      workingClass: number
      college: number
    }
    thinFormalLeadCount: number
    thinPipelineCount: number
    locations: Array<{
      id: string
      code: string
      name: string
      locationType: string
      hasLocationLeadRole: boolean
      rosterCount: number
      localLeadCandidates: number
      readyToLead: number
      categoryLeadsOnRoster: number
      thinPipeline: boolean
      thinFormalLead: boolean
      thin: boolean
    }>
  }
}

export function fetchLeaderReports() {
  return request<LeaderReportsPayload>('leader-reports')
}

export type CalendarBoardRef = {
  id: string
  kind: string
  slug: string
  name: string
  teamId: string | null
  teamSlug: string | null
  locationId: string | null
  locationType: string | null
  segment: string | null
  parentBoardId: string | null
  calendarId: string
  calendarName: string
  path: string
}

export type CalendarRsvpCounts = {
  invited: number
  yes: number
  no: number
  maybe: number
  total: number
}

export type CalendarEventItem = {
  id: string
  occurrenceKey: string
  occurrenceStartsAt: string
  isRecurring: boolean
  recurrenceLabel: string | null
  recurrence: {
    frequency: string
    interval: number
    byWeekday: number[] | null
    until: string | null
    count: number | null
  } | null
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  allDay: boolean
  locationText: string | null
  url: string | null
  visibility: string
  status: string
  sourceCalendarId: string
  sourceBoard: {
    id: string
    slug: string
    name: string
    kind: string
    locationId: string | null
    teamSlug: string | null
  }
  calendarName: string
  rsvpCounts: CalendarRsvpCounts
  createdAt: string
  updatedAt: string
  cancelledAt: string | null
}

export type CalendarRsvpItem = {
  id: string
  eventId: string
  personId: string
  status: string
  notes: string | null
  respondedAt: string | null
  createdAt: string
  updatedAt: string
  person: {
    id: string
    firstName: string
    lastName: string
    preferredName: string | null
    displayName: string
    status: string
  }
}

export function fetchCalendarEvents(params: {
  boardSlug?: string
  locationId?: string
  teamSlug?: string
  mode?: 'rollup' | 'own'
  from?: string
  to?: string
  includeCancelled?: boolean
}) {
  const search = new URLSearchParams()
  if (params.boardSlug) search.set('board', params.boardSlug)
  if (params.locationId) search.set('locationId', params.locationId)
  if (params.teamSlug) search.set('teamSlug', params.teamSlug)
  if (params.mode) search.set('mode', params.mode)
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.includeCancelled) search.set('includeCancelled', '1')
  const qs = search.toString()
  return request<{
    board: CalendarBoardRef
    mode: 'rollup' | 'own'
    events: CalendarEventItem[]
  }>(`leader-calendar-events${qs ? `?${qs}` : ''}`)
}

export function createCalendarEvent(body: {
  boardSlug?: string
  locationId?: string
  teamSlug?: string
  title: string
  description?: string | null
  startsAt: string
  endsAt: string
  allDay?: boolean
  locationText?: string | null
  url?: string | null
  visibility?: 'INTERNAL' | 'PUBLIC'
  recurrenceFrequency?: string | null
  recurrenceInterval?: number | null
  recurrenceByWeekday?: number[] | null
  recurrenceUntil?: string | null
  recurrenceCount?: number | null
}) {
  return request<{ board: CalendarBoardRef; event: CalendarEventItem | undefined }>(
    'leader-calendar-events',
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export function updateCalendarEvent(body: {
  id: string
  title?: string
  description?: string | null
  startsAt?: string
  endsAt?: string
  allDay?: boolean
  locationText?: string | null
  url?: string | null
  visibility?: 'INTERNAL' | 'PUBLIC'
  status?: 'SCHEDULED' | 'CANCELLED'
  cancelScope?: 'one' | 'series'
  occurrenceStartsAt?: string | null
  recurrenceFrequency?: string | null
  recurrenceInterval?: number | null
  recurrenceByWeekday?: number[] | null
  recurrenceUntil?: string | null
  recurrenceCount?: number | null
}) {
  return request<{ id?: string; status?: string; scope?: string }>('leader-calendar-events', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function fetchEventRsvps(eventId: string) {
  return request<{
    event: { id: string; title: string; status: string }
    counts: CalendarRsvpCounts
    rsvps: CalendarRsvpItem[]
  }>(`leader-calendar-rsvps?eventId=${encodeURIComponent(eventId)}`)
}

export function inviteEventRsvps(eventId: string, personIds: string[]) {
  return request<{
    invited: number
    already: number
    counts: CalendarRsvpCounts
    rsvps: CalendarRsvpItem[]
  }>('leader-calendar-rsvps', {
    method: 'POST',
    body: JSON.stringify({ eventId, personIds }),
  })
}

export function setEventRsvp(body: {
  eventId: string
  personId: string
  status: 'INVITED' | 'YES' | 'NO' | 'MAYBE'
  notes?: string | null
}) {
  return request<{
    counts: CalendarRsvpCounts
    rsvps: CalendarRsvpItem[]
  }>('leader-calendar-rsvps', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function removeEventRsvp(eventId: string, personId: string) {
  const qs = new URLSearchParams({ eventId, personId })
  return request<{
    counts: CalendarRsvpCounts
    rsvps: CalendarRsvpItem[]
  }>(`leader-calendar-rsvps?${qs.toString()}`, { method: 'DELETE' })
}

export async function downloadCalendarIcs(params: {
  boardSlug?: string
  locationId?: string
  teamSlug?: string
  mode?: 'rollup' | 'own'
  from?: string
  to?: string
}): Promise<{ ok: true } | { ok: false; error: { message: string } }> {
  const secret = getLeaderWriteSecret()
  if (!secret) {
    return { ok: false, error: { message: 'Leader write access is required.' } }
  }

  const search = new URLSearchParams()
  if (params.boardSlug) search.set('board', params.boardSlug)
  if (params.locationId) search.set('locationId', params.locationId)
  if (params.teamSlug) search.set('teamSlug', params.teamSlug)
  if (params.mode) search.set('mode', params.mode)
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)

  const response = await fetch(`/api/leader-calendar-ics?${search.toString()}`, {
    headers: {
      Accept: 'text/calendar',
      'X-AYC-Leader-Write-Secret': secret,
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    return {
      ok: false,
      error: {
        message: payload?.error?.message ?? 'Could not download calendar.',
      },
    }
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = /filename="([^"]+)"/.exec(disposition)
  const filename = match?.[1] ?? 'ayc-calendar.ics'
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return { ok: true }
}
