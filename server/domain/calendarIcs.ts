/**
 * RFC 5545 iCalendar (.ics) builder for AYC calendar export.
 */

export type IcsEventInput = {
  id: string
  title: string
  description?: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
  locationText?: string | null
  url?: string | null
  status?: string | null
  sourceBoardName?: string | null
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    interval: number
    byWeekday?: number[] | null
    until?: Date | null
    count?: number | null
  } | null
  exceptionStartsAt?: Date[]
}

export type IcsCalendarInput = {
  name: string
  events: IcsEventInput[]
  now?: Date
}

const WEEKDAY_ICS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const

/** Fold lines at 75 octets (approx chars for ASCII ICS). */
export function foldIcsLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let remaining = line
  parts.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`)
    remaining = remaining.slice(74)
  }
  return parts.join('\r\n')
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

export function formatIcsDateUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

export function formatIcsDateOnlyUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
}

export function buildRrule(recurrence: NonNullable<IcsEventInput['recurrence']>): string {
  const parts = [
    `FREQ=${recurrence.frequency}`,
    `INTERVAL=${Math.max(1, recurrence.interval || 1)}`,
  ]
  if (recurrence.byWeekday && recurrence.byWeekday.length > 0) {
    const days = recurrence.byWeekday
      .filter((d) => d >= 0 && d <= 6)
      .map((d) => WEEKDAY_ICS[d])
      .join(',')
    if (days) parts.push(`BYDAY=${days}`)
  }
  if (recurrence.count != null && recurrence.count > 0) {
    parts.push(`COUNT=${Math.floor(recurrence.count)}`)
  } else if (recurrence.until) {
    parts.push(`UNTIL=${formatIcsDateUtc(recurrence.until)}`)
  }
  return `RRULE:${parts.join(';')}`
}

function eventLines(event: IcsEventInput, now: Date): string[] {
  const lines: string[] = ['BEGIN:VEVENT']
  lines.push(`UID:ayc-event-${event.id}@arkansasyouth.netlify.app`)
  lines.push(`DTSTAMP:${formatIcsDateUtc(now)}`)
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDateOnlyUtc(event.startsAt)}`)
    // RFC: DTEND for all-day is exclusive next day.
    const endExclusive = new Date(
      Date.UTC(
        event.endsAt.getUTCFullYear(),
        event.endsAt.getUTCMonth(),
        event.endsAt.getUTCDate() + 1,
      ),
    )
    lines.push(`DTEND;VALUE=DATE:${formatIcsDateOnlyUtc(endExclusive)}`)
  } else {
    lines.push(`DTSTART:${formatIcsDateUtc(event.startsAt)}`)
    lines.push(`DTEND:${formatIcsDateUtc(event.endsAt)}`)
  }
  lines.push(`SUMMARY:${escapeIcsText(event.title)}`)
  const descriptionParts = [event.description?.trim() || '']
  if (event.sourceBoardName) {
    descriptionParts.push(`Source board: ${event.sourceBoardName}`)
  }
  const description = descriptionParts.filter(Boolean).join('\n')
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`)
  if (event.locationText?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(event.locationText.trim())}`)
  }
  if (event.url?.trim()) {
    lines.push(`URL:${escapeIcsText(event.url.trim())}`)
  }
  if (event.recurrence) {
    lines.push(buildRrule(event.recurrence))
  }
  if (event.exceptionStartsAt && event.exceptionStartsAt.length > 0) {
    const exdates = event.exceptionStartsAt
      .map((date) =>
        event.allDay ? formatIcsDateOnlyUtc(date) : formatIcsDateUtc(date),
      )
      .join(',')
    if (event.allDay) {
      lines.push(`EXDATE;VALUE=DATE:${exdates}`)
    } else {
      lines.push(`EXDATE:${exdates}`)
    }
  }
  lines.push(
    event.status === 'CANCELLED' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
  )
  lines.push('END:VEVENT')
  return lines
}

export function buildIcsCalendar(input: IcsCalendarInput): string {
  const now = input.now ?? new Date()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arkansas Youth Coalition//AYC Workbench//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(input.name)}`,
  ]
  for (const event of input.events) {
    lines.push(...eventLines(event, now))
  }
  lines.push('END:VCALENDAR')
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`
}
