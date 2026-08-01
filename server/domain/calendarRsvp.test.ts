import { describe, expect, it } from 'vitest'
import { isCalendarRsvpStatus, tallyRsvpStatuses } from './calendarRsvp.ts'

describe('calendar RSVP helpers', () => {
  it('tallies RSVP statuses', () => {
    const counts = tallyRsvpStatuses(['YES', 'YES', 'NO', 'MAYBE', 'INVITED', 'INVITED'])
    expect(counts).toEqual({
      yes: 2,
      no: 1,
      maybe: 1,
      invited: 2,
      total: 6,
    })
  })

  it('validates RSVP status values', () => {
    expect(isCalendarRsvpStatus('YES')).toBe(true)
    expect(isCalendarRsvpStatus('ATTENDED')).toBe(false)
  })
})
