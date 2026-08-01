export type JoinApplicationBody = {
  firstName: string
  lastName: string
  preferredName?: string
  email: string
  phone?: string
  city?: string
  county?: string
  locationType: string
  locationName?: string
  teamInterest: string
  secondaryInterests?: string[]
  leadInterest: string
  notes?: string
  availabilityNotes?: string
  howHeard?: string
  ageConfirmed: boolean
}

export type JoinApplicationResult = {
  applicationId: string
  referenceCode: string
  status: 'NEW' | 'DUPLICATE'
  teamSlug: string
  teamName: string
  alreadyOnFile?: boolean
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; fields?: Record<string, string> }; status: number }

export async function submitJoinApplication(
  body: JoinApplicationBody,
): Promise<ApiResult<JoinApplicationResult>> {
  const response = await fetch('/api/join-application', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: JoinApplicationResult }
    | { ok: false; error: { message: string; fields?: Record<string, string> } }
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
