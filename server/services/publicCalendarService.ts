import { and, asc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  boards,
  calendarEventExceptions,
  calendarEvents,
  calendars,
} from '../db/schema.ts'
import { buildIcsCalendar, type IcsEventInput } from '../domain/calendarIcs.ts'
import {
  expandOccurrences,
  recurrenceLabel,
  type RecurrenceRule,
} from '../domain/calendarRecurrence.ts'

export type PublicCalendarListInput = {
  from?: string | null
  to?: string | null
}

function windowBounds(input: PublicCalendarListInput) {
  const fromDate = input.from
    ? new Date(input.from)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const toDate = input.to
    ? new Date(input.to)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  return { fromDate, toDate }
}

async function loadPublicMasterEvents(
  db: AycDatabase,
  fromDate: Date,
  toDate: Date,
) {
  return db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startsAt: calendarEvents.startsAt,
      endsAt: calendarEvents.endsAt,
      allDay: calendarEvents.allDay,
      locationText: calendarEvents.locationText,
      url: calendarEvents.url,
      status: calendarEvents.status,
      recurrenceFrequency: calendarEvents.recurrenceFrequency,
      recurrenceInterval: calendarEvents.recurrenceInterval,
      recurrenceByWeekday: calendarEvents.recurrenceByWeekday,
      recurrenceUntil: calendarEvents.recurrenceUntil,
      recurrenceCount: calendarEvents.recurrenceCount,
      boardName: boards.name,
      boardSlug: boards.slug,
      boardKind: boards.kind,
    })
    .from(calendarEvents)
    .innerJoin(calendars, eq(calendars.id, calendarEvents.sourceCalendarId))
    .innerJoin(boards, eq(boards.id, calendars.boardId))
    .where(
      and(
        eq(calendarEvents.visibility, 'PUBLIC'),
        eq(calendarEvents.status, 'SCHEDULED'),
        eq(boards.active, true),
        or(
          and(
            sql`${calendarEvents.recurrenceFrequency} is null`,
            gte(calendarEvents.endsAt, fromDate),
            lte(calendarEvents.startsAt, toDate),
          ),
          and(
            sql`${calendarEvents.recurrenceFrequency} is not null`,
            lte(calendarEvents.startsAt, toDate),
            or(
              sql`${calendarEvents.recurrenceUntil} is null`,
              gte(calendarEvents.recurrenceUntil, fromDate),
            ),
          ),
        ),
      ),
    )
    .orderBy(asc(calendarEvents.startsAt))
    .limit(500)
}

export async function listPublicCalendarEvents(
  db: AycDatabase,
  input: PublicCalendarListInput = {},
) {
  const { fromDate, toDate } = windowBounds(input)
  const rows = await loadPublicMasterEvents(db, fromDate, toDate)
  const eventIds = rows.map((row) => row.id)
  const exceptionsByEvent = new Map<string, Set<string>>()

  if (eventIds.length > 0) {
    const exceptionRows = await db
      .select({
        eventId: calendarEventExceptions.eventId,
        occurrenceStartsAt: calendarEventExceptions.occurrenceStartsAt,
      })
      .from(calendarEventExceptions)
      .where(inArray(calendarEventExceptions.eventId, eventIds))
    for (const row of exceptionRows) {
      const set = exceptionsByEvent.get(row.eventId) ?? new Set<string>()
      set.add(row.occurrenceStartsAt.toISOString())
      exceptionsByEvent.set(row.eventId, set)
    }
  }

  const events = []
  for (const row of rows) {
    const rule: RecurrenceRule | null = row.recurrenceFrequency
      ? {
          frequency: row.recurrenceFrequency as RecurrenceRule['frequency'],
          interval: row.recurrenceInterval ?? 1,
          byWeekday: row.recurrenceByWeekday,
          until: row.recurrenceUntil,
          count: row.recurrenceCount,
        }
      : null
    const occurrences = expandOccurrences(
      { startsAt: row.startsAt, endsAt: row.endsAt, recurrence: rule },
      fromDate,
      toDate,
    )
    const cancelled = exceptionsByEvent.get(row.id) ?? new Set<string>()
    const label = recurrenceLabel(rule)
    for (const occurrence of occurrences) {
      const occurrenceStartsAt = occurrence.startsAt.toISOString()
      if (cancelled.has(occurrenceStartsAt)) continue
      events.push({
        id: row.id,
        occurrenceKey: `${row.id}_${occurrenceStartsAt}`,
        occurrenceStartsAt,
        isRecurring: occurrence.isRecurring,
        recurrenceLabel: label,
        title: row.title,
        description: row.description,
        startsAt: occurrenceStartsAt,
        endsAt: occurrence.endsAt.toISOString(),
        allDay: row.allDay,
        locationText: row.locationText,
        url: row.url,
        sourceBoard: {
          name: row.boardName,
          slug: row.boardSlug,
          kind: row.boardKind,
        },
      })
    }
  }

  events.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return {
    generatedAt: new Date().toISOString(),
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    events: events.slice(0, 500),
  }
}

export async function exportPublicCalendarIcs(
  db: AycDatabase,
  input: PublicCalendarListInput = {},
) {
  const { fromDate, toDate } = windowBounds(input)
  const rows = await loadPublicMasterEvents(db, fromDate, toDate)
  const eventIds = rows.map((row) => row.id)
  const exceptionsByEvent = new Map<string, Date[]>()

  if (eventIds.length > 0) {
    const exceptionRows = await db
      .select({
        eventId: calendarEventExceptions.eventId,
        occurrenceStartsAt: calendarEventExceptions.occurrenceStartsAt,
      })
      .from(calendarEventExceptions)
      .where(inArray(calendarEventExceptions.eventId, eventIds))
    for (const row of exceptionRows) {
      const list = exceptionsByEvent.get(row.eventId) ?? []
      list.push(row.occurrenceStartsAt)
      exceptionsByEvent.set(row.eventId, list)
    }
  }

  const events: IcsEventInput[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    allDay: row.allDay,
    locationText: row.locationText,
    url: row.url,
    status: row.status,
    sourceBoardName: row.boardName,
    recurrence: row.recurrenceFrequency
      ? {
          frequency: row.recurrenceFrequency as 'DAILY' | 'WEEKLY' | 'MONTHLY',
          interval: row.recurrenceInterval ?? 1,
          byWeekday: row.recurrenceByWeekday,
          until: row.recurrenceUntil,
          count: row.recurrenceCount,
        }
      : null,
    exceptionStartsAt: exceptionsByEvent.get(row.id) ?? [],
  }))

  const body = buildIcsCalendar({
    name: 'Arkansas Youth Coalition Public Calendar',
    events,
  })

  return {
    filename: 'ayc-public-calendar.ics',
    body,
    calendarName: 'Arkansas Youth Coalition Public Calendar',
  }
}
