export type CalendarViewMode = 'month' | 'week' | 'day'

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function startOfWeek(date: Date) {
  const d = startOfDay(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function endOfWeek(date: Date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return endOfDay(d)
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

/** Inclusive fetch window for the active view (with small padding). */
export function rangeForView(view: CalendarViewMode, cursor: Date) {
  if (view === 'day') {
    return { from: startOfDay(cursor), to: endOfDay(cursor) }
  }
  if (view === 'week') {
    return { from: startOfWeek(cursor), to: endOfWeek(cursor) }
  }
  const monthStart = startOfMonth(cursor)
  const gridStart = startOfWeek(monthStart)
  const monthEnd = endOfMonth(cursor)
  const gridEnd = endOfWeek(monthEnd)
  return { from: gridStart, to: gridEnd }
}

export function shiftCursor(view: CalendarViewMode, cursor: Date, direction: -1 | 1) {
  if (view === 'day') return addDays(startOfDay(cursor), direction)
  if (view === 'week') return addDays(startOfWeek(cursor), direction * 7)
  return addMonths(startOfMonth(cursor), direction)
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatCursorLabel(view: CalendarViewMode, cursor: Date) {
  if (view === 'day') {
    return cursor.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
  if (view === 'week') {
    const start = startOfWeek(cursor)
    const end = addDays(start, 6)
    const sameMonth = start.getMonth() === end.getMonth()
    if (sameMonth) {
      return `${start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} · ${start.getDate()}–${end.getDate()}`
    }
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export function minutesFromMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

export const HOUR_START = 6
export const HOUR_END = 22
export const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i)
