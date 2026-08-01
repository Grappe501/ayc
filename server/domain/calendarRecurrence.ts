/**
 * Calendar recurrence expansion (CAL recurrence pass).
 * Master event stores the rule; list views expand occurrences in the query window.
 */

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export type RecurrenceRule = {
  frequency: RecurrenceFrequency
  interval: number
  byWeekday?: number[] | null
  until?: Date | null
  count?: number | null
}

export type RecurrenceMaster = {
  startsAt: Date
  endsAt: Date
  recurrence: RecurrenceRule | null
}

export type ExpandedOccurrence = {
  startsAt: Date
  endsAt: Date
  isRecurring: boolean
  occurrenceIndex: number
}

const MAX_OCCURRENCES = 200

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime())
  const day = next.getUTCDate()
  next.setUTCMonth(next.getUTCMonth() + months)
  // Clamp overflow (e.g. Jan 31 + 1 month).
  if (next.getUTCDate() < day) {
    next.setUTCDate(0)
  }
  return next
}

function durationMs(startsAt: Date, endsAt: Date): number {
  return Math.max(0, endsAt.getTime() - startsAt.getTime())
}

function withinWindow(startsAt: Date, from: Date, to: Date): boolean {
  return startsAt.getTime() >= from.getTime() && startsAt.getTime() <= to.getTime()
}

function normalizeWeekdays(values: number[] | null | undefined): number[] | null {
  if (!values || values.length === 0) return null
  const cleaned = [...new Set(values.filter((d) => d >= 0 && d <= 6))].sort((a, b) => a - b)
  return cleaned.length > 0 ? cleaned : null
}

export function parseRecurrenceInput(input: {
  frequency?: string | null
  interval?: number | null
  byWeekday?: number[] | null
  until?: string | null
  count?: number | null
}): RecurrenceRule | null {
  const frequency = (input.frequency ?? '').trim().toUpperCase()
  if (!frequency || frequency === 'NONE') return null
  if (frequency !== 'DAILY' && frequency !== 'WEEKLY' && frequency !== 'MONTHLY') {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { recurrenceFrequency: 'Use DAILY, WEEKLY, MONTHLY, or none' },
    })
  }
  const interval = Math.min(30, Math.max(1, Number(input.interval ?? 1) || 1))
  const count =
    input.count == null || input.count === undefined
      ? null
      : Math.min(365, Math.max(1, Math.floor(Number(input.count))))
  const until = input.until ? new Date(input.until) : null
  if (until && Number.isNaN(until.getTime())) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { recurrenceUntil: 'Invalid end date' },
    })
  }
  if (frequency === 'WEEKLY') {
    const byWeekday = normalizeWeekdays(input.byWeekday)
    return { frequency, interval, byWeekday, until, count: count && count > 0 ? count : null }
  }
  return {
    frequency,
    interval,
    byWeekday: null,
    until,
    count: count && count > 0 ? count : null,
  }
}

export function expandOccurrences(
  master: RecurrenceMaster,
  from: Date,
  to: Date,
): ExpandedOccurrence[] {
  const duration = durationMs(master.startsAt, master.endsAt)
  if (!master.recurrence) {
    if (!withinWindow(master.startsAt, from, to)) return []
    return [
      {
        startsAt: master.startsAt,
        endsAt: master.endsAt,
        isRecurring: false,
        occurrenceIndex: 0,
      },
    ]
  }

  const rule = master.recurrence
  const results: ExpandedOccurrence[] = []
  let index = 0
  let generated = 0

  const hardEnd = rule.until
    ? new Date(Math.min(to.getTime(), rule.until.getTime()))
    : to
  const maxCount = rule.count ?? MAX_OCCURRENCES

  if (rule.frequency === 'WEEKLY' && rule.byWeekday && rule.byWeekday.length > 0) {
    // Anchor to the Sunday (UTC) of the master's week, then step by interval weeks.
    const masterDay = Date.UTC(
      master.startsAt.getUTCFullYear(),
      master.startsAt.getUTCMonth(),
      master.startsAt.getUTCDate(),
    )
    const masterWeekday = master.startsAt.getUTCDay()
    let weekStart = masterDay - masterWeekday * 24 * 60 * 60 * 1000
    let weekIndex = 0

    while (generated < MAX_OCCURRENCES) {
      if (rule.count != null && generated >= rule.count) break
      if (weekIndex > 0 && weekIndex % rule.interval !== 0) {
        weekIndex += 1
        weekStart += 7 * 24 * 60 * 60 * 1000
        if (weekStart > hardEnd.getTime() + 7 * 24 * 60 * 60 * 1000) break
        continue
      }

      for (const weekday of rule.byWeekday) {
        if (rule.count != null && generated >= rule.count) break
        const dayMs = weekStart + weekday * 24 * 60 * 60 * 1000
        const occurrenceStart = new Date(dayMs)
        occurrenceStart.setUTCHours(
          master.startsAt.getUTCHours(),
          master.startsAt.getUTCMinutes(),
          master.startsAt.getUTCSeconds(),
          master.startsAt.getUTCMilliseconds(),
        )
        if (occurrenceStart.getTime() < master.startsAt.getTime()) continue
        if (rule.until && occurrenceStart.getTime() > rule.until.getTime()) continue
        if (occurrenceStart.getTime() > hardEnd.getTime() && occurrenceStart.getTime() > to.getTime()) {
          continue
        }
        if (withinWindow(occurrenceStart, from, to)) {
          results.push({
            startsAt: occurrenceStart,
            endsAt: new Date(occurrenceStart.getTime() + duration),
            isRecurring: true,
            occurrenceIndex: index,
          })
        }
        generated += 1
        index += 1
      }

      weekIndex += 1
      weekStart += 7 * 24 * 60 * 60 * 1000
      if (weekStart > hardEnd.getTime() + 7 * 24 * 60 * 60 * 1000) break
      if (rule.until && weekStart > rule.until.getTime()) break
    }
    return results.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
  }

  let cursor = new Date(master.startsAt)
  while (generated < Math.min(maxCount, MAX_OCCURRENCES)) {
    if (rule.until && cursor.getTime() > rule.until.getTime()) break
    if (cursor.getTime() > hardEnd.getTime() && cursor.getTime() > to.getTime()) break

    if (withinWindow(cursor, from, to)) {
      results.push({
        startsAt: new Date(cursor.getTime()),
        endsAt: new Date(cursor.getTime() + duration),
        isRecurring: true,
        occurrenceIndex: index,
      })
    }

    generated += 1
    index += 1
    if (rule.frequency === 'DAILY') cursor = addDays(cursor, rule.interval)
    else if (rule.frequency === 'WEEKLY') cursor = addDays(cursor, 7 * rule.interval)
    else cursor = addMonths(cursor, rule.interval)

    // Stop if we've passed the window and count/until allow continuing uselessly.
    if (cursor.getTime() > to.getTime() && (!rule.count || generated >= (rule.count ?? 0))) {
      if (cursor.getTime() > to.getTime()) break
    }
    if (cursor.getTime() > to.getTime() + 366 * 24 * 60 * 60 * 1000) break
  }

  return results
}

export function recurrenceLabel(rule: RecurrenceRule | null | undefined): string | null {
  if (!rule) return null
  const interval = rule.interval > 1 ? ` every ${rule.interval}` : ''
  if (rule.frequency === 'DAILY') return `Daily${interval}`
  if (rule.frequency === 'MONTHLY') return `Monthly${interval}`
  if (rule.byWeekday && rule.byWeekday.length > 0) {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const days = rule.byWeekday.map((d) => names[d] ?? '?').join(', ')
    return `Weekly${interval} (${days})`
  }
  return `Weekly${interval}`
}
