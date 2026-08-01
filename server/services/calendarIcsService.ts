import { and, eq, gte, inArray, lte, ne, or, sql } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  boards,
  calendarEventExceptions,
  calendarEvents,
  calendars,
} from '../db/schema.ts'
import { buildIcsCalendar, type IcsEventInput } from '../domain/calendarIcs.ts'
import type { UnlockScope } from '../http/auth.ts'
import {
  listRollupCalendarIds,
  resolveBoard,
  scopeCanAccessResolvedBoard,
} from './calendarService.ts'

export type ExportCalendarIcsInput = {
  boardSlug?: string | null
  locationId?: string | null
  teamSlug?: string | null
  mode?: 'rollup' | 'own'
  from?: string | null
  to?: string | null
}

export async function exportCalendarIcs(
  db: AycDatabase,
  input: ExportCalendarIcsInput,
  scope: UnlockScope,
): Promise<{ filename: string; body: string; calendarName: string }> {
  const board = await resolveBoard(db, input)
  if (!scopeCanAccessResolvedBoard(scope, board)) {
    throw Object.assign(new Error('FORBIDDEN'), {
      code: 'FORBIDDEN' as const,
      message: 'This key cannot export this calendar.',
    })
  }

  const mode = input.mode === 'own' ? 'own' : 'rollup'
  const calendarIds =
    mode === 'own' ? [board.calendarId] : await listRollupCalendarIds(db, board)

  const fromDate = input.from
    ? new Date(input.from)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = input.to
    ? new Date(input.to)
    : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)

  const rows = await db
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
    })
    .from(calendarEvents)
    .innerJoin(calendars, eq(calendars.id, calendarEvents.sourceCalendarId))
    .innerJoin(boards, eq(boards.id, calendars.boardId))
    .where(
      and(
        inArray(calendarEvents.sourceCalendarId, calendarIds),
        ne(calendarEvents.status, 'CANCELLED'),
        or(
          and(
            sql`${calendarEvents.recurrenceFrequency} is null`,
            lte(calendarEvents.startsAt, toDate),
            gte(calendarEvents.endsAt, fromDate),
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
    .limit(500)

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

  const calendarName =
    mode === 'rollup' ? `${board.name} (rollup)` : board.calendarName
  const body = buildIcsCalendar({ name: calendarName, events })
  const safeSlug = board.slug.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 48)
  const filename = `ayc-${safeSlug}-${mode}.ics`

  return { filename, body, calendarName }
}
