import { describe, expect, it } from 'vitest'
import {
  expandOccurrences,
  parseRecurrenceInput,
  recurrenceLabel,
} from './calendarRecurrence.ts'

describe('calendar recurrence', () => {
  it('expands a weekly series inside a window', () => {
    const startsAt = new Date('2026-08-03T17:00:00.000Z') // Monday
    const endsAt = new Date('2026-08-03T18:00:00.000Z')
    const from = new Date('2026-08-01T00:00:00.000Z')
    const to = new Date('2026-08-31T23:59:59.000Z')
    const occurrences = expandOccurrences(
      {
        startsAt,
        endsAt,
        recurrence: {
          frequency: 'WEEKLY',
          interval: 1,
          byWeekday: null,
          until: new Date('2026-08-24T23:59:59.000Z'),
          count: null,
        },
      },
      from,
      to,
    )
    expect(occurrences.length).toBe(4)
    expect(occurrences[0]?.startsAt.toISOString()).toBe('2026-08-03T17:00:00.000Z')
    expect(occurrences[1]?.startsAt.toISOString()).toBe('2026-08-10T17:00:00.000Z')
  })

  it('expands daily with interval and count', () => {
    const occurrences = expandOccurrences(
      {
        startsAt: new Date('2026-08-01T12:00:00.000Z'),
        endsAt: new Date('2026-08-01T13:00:00.000Z'),
        recurrence: {
          frequency: 'DAILY',
          interval: 2,
          until: null,
          count: 3,
        },
      },
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-08-10T00:00:00.000Z'),
    )
    expect(occurrences.map((row) => row.startsAt.toISOString())).toEqual([
      '2026-08-01T12:00:00.000Z',
      '2026-08-03T12:00:00.000Z',
      '2026-08-05T12:00:00.000Z',
    ])
  })

  it('parses recurrence input and labels', () => {
    const rule = parseRecurrenceInput({
      frequency: 'weekly',
      interval: 1,
      byWeekday: [1, 3],
    })
    expect(rule?.frequency).toBe('WEEKLY')
    expect(recurrenceLabel(rule)).toContain('Mon')
    expect(parseRecurrenceInput({ frequency: 'NONE' })).toBeNull()
  })

  it('expands weekly by weekday selections', () => {
    const occurrences = expandOccurrences(
      {
        startsAt: new Date('2026-08-03T15:00:00.000Z'), // Monday
        endsAt: new Date('2026-08-03T16:00:00.000Z'),
        recurrence: {
          frequency: 'WEEKLY',
          interval: 1,
          byWeekday: [1, 3],
          until: new Date('2026-08-14T23:59:59.000Z'),
          count: null,
        },
      },
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-08-14T23:59:59.000Z'),
    )
    expect(occurrences.map((row) => row.startsAt.toISOString())).toEqual([
      '2026-08-03T15:00:00.000Z',
      '2026-08-05T15:00:00.000Z',
      '2026-08-10T15:00:00.000Z',
      '2026-08-12T15:00:00.000Z',
    ])
  })
})

