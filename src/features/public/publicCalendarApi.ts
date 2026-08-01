export type PublicCalendarEvent = {
  id: string
  occurrenceKey: string
  occurrenceStartsAt: string
  isRecurring: boolean
  recurrenceLabel: string | null
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  allDay: boolean
  locationText: string | null
  url: string | null
  sourceBoard: {
    name: string
    slug: string
    kind: string
  }
}

export async function fetchPublicCalendarEvents(params: {
  from?: string
  to?: string
} = {}) {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  const qs = search.toString()
  const response = await fetch(`/api/public-calendar-events${qs ? `?${qs}` : ''}`, {
    headers: { Accept: 'application/json' },
  })
  const payload = (await response.json().catch(() => null)) as
    | {
        ok: true
        data: {
          generatedAt: string
          from: string
          to: string
          events: PublicCalendarEvent[]
        }
      }
    | { ok: false; error: { message: string } }
    | null

  if (!payload) {
    return {
      ok: false as const,
      error: { message: 'Unexpected server response.' },
    }
  }
  if (!payload.ok) {
    return { ok: false as const, error: payload.error }
  }
  return { ok: true as const, data: payload.data }
}

export function publicCalendarIcsHref(params: { from?: string; to?: string } = {}) {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  const qs = search.toString()
  return `/api/public-calendar-ics${qs ? `?${qs}` : ''}`
}
