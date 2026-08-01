import { getAccessToken } from '@/features/auth/authSession'
import { getLeaderWriteSecret } from '@/features/leader/leaderSession'
import type { ProfileFields } from './profileApi'

export type DirectorySummary = {
  activePeople: number
  leads: number
  volunteers: number
  locations: number
}

export type DirectoryPerson = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  position: string | null
  location: {
    id: string
    code: string
    name: string
    locationType: string
  } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
  } | null
  email: string | null
  phone: string | null
  contactRevealed: boolean
  createdAt: string
}

export type DirectoryTeam = {
  name: string
  slug: string
  code: string
  description: string
  activePeople: number
  leads: number
  volunteers: number
  locationsRepresented: number
}

export type DirectoryLocation = {
  id: string
  code: string
  compositeCode: string
  name: string
  locationType: string
  city: string | null
  countyName: string | null
  activePeople: number
  leads: number
  teamsRepresented: number
}

export type ProfileNote = {
  id: string
  personId: string
  authorPersonId: string | null
  authorDisplayName: string
  body: string
  visibility: string
  createdAt: string
}

export type DirectoryPersonDetail = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  preferredContactMethod: string | null
  email: string | null
  phone: string | null
  contactRevealed: boolean
  hasContactMethods: boolean
  location: {
    id: string
    name: string
    code: string
    locationType: string
    city: string | null
    countyName: string | null
  } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
    position: string
  } | null
  additionalTeams: Array<{
    id: string
    name: string
    slug: string
    position: string
  }>
  profile: ProfileFields
  notes: ProfileNote[]
  hasAccount: boolean
  viewer: {
    isOwner: boolean
    isLeader: boolean
    canEditProfile: boolean
    canLeaveNote: boolean
    personId: string | null
  }
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { message: string }; status: number }

async function request<T>(path: string): Promise<ApiResult<T>> {
  const headers = new Headers({ Accept: 'application/json' })
  const secret = getLeaderWriteSecret()
  if (secret) headers.set('X-AYC-Leader-Write-Secret', secret)
  const token = await getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`/api/${path}`, { headers })
  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: T }
    | { ok: false; error: { message: string } }
    | null

  if (!payload) {
    return {
      ok: false,
      status: response.status,
      error: { message: 'Unexpected server response.' },
    }
  }
  if (!payload.ok) {
    return { ok: false, status: response.status, error: payload.error }
  }
  return { ok: true, data: payload.data }
}

export function fetchDirectorySummary() {
  return request<DirectorySummary>('directory-summary')
}

export function fetchDirectoryPeople(params: URLSearchParams) {
  const qs = new URLSearchParams(params)
  qs.set('view', 'people')
  return request<{
    view: 'people'
    total: number
    people: DirectoryPerson[]
    contactRevealed: boolean
  }>(`directory?${qs.toString()}`)
}

export function fetchDirectoryTeams() {
  return request<{ view: 'teams'; teams: DirectoryTeam[] }>('directory?view=teams')
}

export function fetchDirectoryLocations() {
  return request<{ view: 'locations'; locations: DirectoryLocation[] }>(
    'directory?view=locations',
  )
}

export function fetchDirectoryOptions() {
  return request<{
    view: 'options'
    locations: Array<{
      id: string
      name: string
      code: string
      locationType: string
    }>
    teams: Array<{ id: string; name: string; slug: string }>
  }>('directory?view=options')
}

export function fetchDirectoryPerson(personId: string) {
  return request<DirectoryPersonDetail>(
    `directory-person?id=${encodeURIComponent(personId)}`,
  )
}
