import { describe, expect, it } from 'vitest'
import {
  buildIcsCalendar,
  buildRrule,
  escapeIcsText,
  foldIcsLine,
  formatIcsDateUtc,
} from './calendarIcs.ts'

describe('calendar ICS builder', () => {
  it('escapes text and formats UTC timestamps', () => {
    expect(escapeIcsText('Hello; world, ok\nnext')).toBe(
      'Hello\\; world\\, ok\\nnext',
    )
    expect(formatIcsDateUtc(new Date('2026-08-03T17:30:00.000Z'))).toBe(
      '20260803T173000Z',
    )
  })

  it('builds weekly RRULE with BYDAY', () => {
    expect(
      buildRrule({
        frequency: 'WEEKLY',
        interval: 1,
        byWeekday: [1, 3],
        count: 8,
      }),
    ).toBe('RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE;COUNT=8')
  })

  it('folds long lines and emits a valid VCALENDAR', () => {
    const long = 'A'.repeat(90)
    expect(foldIcsLine(`SUMMARY:${long}`).split('\r\n').length).toBeGreaterThan(1)

    const ics = buildIcsCalendar({
      name: 'Main Calendar',
      now: new Date('2026-08-01T12:00:00.000Z'),
      events: [
        {
          id: 'evt-1',
          title: 'Organizer huddle',
          description: 'Weekly sync',
          startsAt: new Date('2026-08-03T17:00:00.000Z'),
          endsAt: new Date('2026-08-03T18:00:00.000Z'),
          allDay: false,
          locationText: 'Little Rock',
          sourceBoardName: 'Organizer Lead Board',
          recurrence: {
            frequency: 'WEEKLY',
            interval: 1,
            until: new Date('2026-09-01T00:00:00.000Z'),
          },
          exceptionStartsAt: [new Date('2026-08-10T17:00:00.000Z')],
        },
      ],
    })

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:Organizer huddle')
    expect(ics).toContain('RRULE:FREQ=WEEKLY;INTERVAL=1;UNTIL=20260901T000000Z')
    expect(ics).toContain('EXDATE:20260810T170000Z')
    expect(ics).toContain('UID:ayc-event-evt-1@arkansasyouth.netlify.app')
    expect(ics.endsWith('\r\n')).toBe(true)
  })
})
