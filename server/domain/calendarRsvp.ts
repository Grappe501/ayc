import type { CalendarRsvpStatus } from './enums.ts'

export type RsvpCounts = {
  invited: number
  yes: number
  no: number
  maybe: number
  total: number
}

export function emptyRsvpCounts(): RsvpCounts {
  return { invited: 0, yes: 0, no: 0, maybe: 0, total: 0 }
}

export function tallyRsvpStatuses(statuses: string[]): RsvpCounts {
  const counts = emptyRsvpCounts()
  for (const status of statuses) {
    if (status === 'INVITED') counts.invited += 1
    else if (status === 'YES') counts.yes += 1
    else if (status === 'NO') counts.no += 1
    else if (status === 'MAYBE') counts.maybe += 1
    counts.total += 1
  }
  return counts
}

export function isCalendarRsvpStatus(value: string): value is CalendarRsvpStatus {
  return value === 'INVITED' || value === 'YES' || value === 'NO' || value === 'MAYBE'
}
