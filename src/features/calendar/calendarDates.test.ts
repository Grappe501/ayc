import { describe, expect, it } from 'vitest'
import {
  formatCursorLabel,
  rangeForView,
  shiftCursor,
  startOfMonth,
  startOfWeek,
} from './calendarDates'

describe('calendarDates', () => {
  it('shifts month/week/day cursors', () => {
    const cursor = new Date(2026, 7, 15)
    const nextMonth = shiftCursor('month', cursor, 1)
    expect(nextMonth.getMonth()).toBe(8)
    const nextWeek = shiftCursor('week', cursor, 1)
    expect(nextWeek.getDate()).toBe(startOfWeek(cursor).getDate() + 7)
    const nextDay = shiftCursor('day', cursor, 1)
    expect(nextDay.getDate()).toBe(16)
  })

  it('builds a month grid range covering leading/trailing weeks', () => {
    const cursor = startOfMonth(new Date(2026, 7, 1))
    const { from, to } = rangeForView('month', cursor)
    expect(from.getDay()).toBe(0)
    expect(to.getDay()).toBe(6)
    expect(from.getTime()).toBeLessThanOrEqual(cursor.getTime())
    expect(to.getTime()).toBeGreaterThanOrEqual(cursor.getTime())
  })

  it('formats labels', () => {
    const cursor = new Date(2026, 7, 1)
    expect(formatCursorLabel('month', cursor)).toContain('2026')
    expect(formatCursorLabel('day', cursor).length).toBeGreaterThan(5)
  })
})
