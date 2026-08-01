import { getLeaderWriteSecret } from '@/features/leader/leaderSession'
import { getAccessToken } from '@/features/auth/authSession'

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; fields?: Record<string, string> } }

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = await getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const secret = getLeaderWriteSecret()
  if (secret) headers.set('X-AYC-Leader-Write-Secret', secret)

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

export type ProfileFields = {
  hometown: string | null
  major: string | null
  interests: string | null
  narrative: string | null
  photoPath: string | null
  photoUrl: string | null
  updatedAt: string | null
}

export function updateProfile(
  personId: string,
  body: {
    hometown?: string | null
    major?: string | null
    interests?: string | null
    narrative?: string | null
  },
) {
  return request<{ profile: ProfileFields }>('person-profile', {
    method: 'PATCH',
    body: JSON.stringify({ personId, ...body }),
  })
}

export async function uploadProfilePhoto(
  personId: string,
  file: File,
): Promise<ApiResult<{ profile: ProfileFields }>> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!)
  const dataBase64 = btoa(binary)
  return request<{ profile: ProfileFields }>('person-profile-photo', {
    method: 'POST',
    body: JSON.stringify({
      personId,
      contentType: file.type || 'image/jpeg',
      dataBase64,
    }),
  })
}

export function createProfileNote(
  personId: string,
  body: string,
  visibility: 'PUBLIC' | 'PRIVATE',
) {
  return request<{
    note: {
      id: string
      personId: string
      authorPersonId: string | null
      authorDisplayName: string
      body: string
      visibility: string
      createdAt: string
    }
  }>('person-profile-notes', {
    method: 'POST',
    body: JSON.stringify({ personId, body, visibility }),
  })
}

export function archiveProfileNote(noteId: string) {
  return request<{ id: string; archived: boolean }>(
    `person-profile-notes?id=${encodeURIComponent(noteId)}`,
    { method: 'DELETE' },
  )
}
