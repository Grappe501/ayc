import { and, asc, eq, gte, inArray, isNull, lte, ne } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  boards,
  calendarEvents,
  calendars,
  locations,
  teams,
} from '../db/schema.ts'
import { boardIdsForRollup } from '../domain/calendarRollup.ts'
import {
  isLocationCategorySlug,
  locationCategoryBoardSlug,
  locationTeamBoardSlug,
} from '../domain/locationBoards.ts'
import type { UnlockScope } from '../http/auth.ts'
import {
  scopeCanAccessLocationCategoryBoard,
  scopeCanAccessLocationTeamBoard,
  scopeCanAccessSegmentBoard,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
} from '../http/auth.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { ensureCalendarForBoard } from './ensureCalendar.ts'
import { ensureLocationBoards } from './ensureLocationBoards.ts'

export type BoardResolveInput = {
  boardSlug?: string | null
  locationId?: string | null
  teamSlug?: string | null
}

export type ResolvedBoard = {
  id: string
  kind: string
  slug: string
  name: string
  teamId: string | null
  teamSlug: string | null
  locationId: string | null
  locationType: string | null
  segment: string | null
  parentBoardId: string | null
  calendarId: string
  calendarName: string
  path: string
}

async function findBoardBySlug(db: AycDatabase, slug: string) {
  const [row] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.slug, slug), isNull(boards.archivedAt)))
    .limit(1)
  return row ?? null
}

function boardPath(board: {
  kind: string
  slug: string
  locationId: string | null
  teamSlug: string | null
}): string {
  if (board.kind === 'MAIN') return '/leader/calendar?board=main'
  if (board.kind === 'SECONDARY' && board.slug === 'graphic-design') {
    return '/leader/calendar?board=graphic-design'
  }
  if (board.kind === 'STATEWIDE_CATEGORY') {
    return `/leader/calendar?board=${board.slug}`
  }
  if (board.kind === 'SEGMENT') {
    return `/leader/calendar?board=${board.slug}`
  }
  if (board.kind === 'LOCATION_TEAM' && board.locationId) {
    return `/leader/calendar?locationId=${board.locationId}`
  }
  if (board.kind === 'LOCATION_CATEGORY' && board.locationId && board.teamSlug) {
    return `/leader/calendar?locationId=${board.locationId}&teamSlug=${board.teamSlug}`
  }
  return '/leader/calendar'
}

export async function resolveBoard(
  db: AycDatabase,
  input: BoardResolveInput,
): Promise<ResolvedBoard> {
  let board =
    input.boardSlug?.trim()
      ? await findBoardBySlug(db, input.boardSlug.trim())
      : null

  if (!board && input.locationId?.trim()) {
    await ensureLocationBoards(db, input.locationId.trim())
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, input.locationId.trim()))
      .limit(1)
    if (!location) {
      throw Object.assign(new Error('NOT_FOUND'), {
        code: 'NOT_FOUND' as const,
        message: 'Location not found.',
      })
    }
    const categorySlug = input.teamSlug?.trim()
    let slug: string
    if (categorySlug) {
      if (!isLocationCategorySlug(categorySlug)) {
        throw Object.assign(new Error('VALIDATION_ERROR'), {
          code: 'VALIDATION_ERROR' as const,
          fields: { teamSlug: 'Invalid location category' },
        })
      }
      slug = locationCategoryBoardSlug(location.compositeCode, categorySlug)
    } else {
      slug = locationTeamBoardSlug(location.compositeCode)
    }
    board = await findBoardBySlug(db, slug)
  }

  if (!board && !input.boardSlug && !input.locationId) {
    board = await findBoardBySlug(db, 'main')
  }

  if (!board) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Board not found.',
    })
  }

  let teamSlug: string | null = null
  if (board.teamId) {
    const [team] = await db
      .select({ slug: teams.slug })
      .from(teams)
      .where(eq(teams.id, board.teamId))
      .limit(1)
    teamSlug = team?.slug ?? null
  }

  let locationType: string | null = null
  if (board.locationId) {
    const [location] = await db
      .select({ locationType: locations.locationType })
      .from(locations)
      .where(eq(locations.id, board.locationId))
      .limit(1)
    locationType = location?.locationType ?? null
  }

  const calendar = await ensureCalendarForBoard(db, board.id, board.name)

  return {
    id: board.id,
    kind: board.kind,
    slug: board.slug,
    name: board.name,
    teamId: board.teamId,
    teamSlug,
    locationId: board.locationId,
    locationType,
    segment: board.segment,
    parentBoardId: board.parentBoardId,
    calendarId: calendar.id,
    calendarName: calendar.name,
    path: boardPath({
      kind: board.kind,
      slug: board.slug,
      locationId: board.locationId,
      teamSlug,
    }),
  }
}

export function scopeCanAccessResolvedBoard(
  scope: UnlockScope,
  board: ResolvedBoard,
): boolean {
  if (board.kind === 'MAIN') return scopeCanAccessStatewideLeaderBoard(scope)
  if (board.kind === 'STATEWIDE_CATEGORY' && board.teamSlug) {
    return scopeCanAccessTeamBoard(scope, board.teamSlug)
  }
  if (board.kind === 'SECONDARY' && board.teamSlug) {
    return scopeCanAccessTeamBoard(scope, board.teamSlug)
  }
  if (board.kind === 'SEGMENT') {
    if (board.segment === 'HIGH_SCHOOL') {
      return scopeCanAccessSegmentBoard(scope, 'high-school')
    }
    if (board.segment === 'WORKING_CLASS') {
      return scopeCanAccessSegmentBoard(scope, 'working-class')
    }
    return false
  }
  if (board.kind === 'LOCATION_TEAM' && board.locationType) {
    return scopeCanAccessLocationTeamBoard(
      scope,
      board.locationType,
      board.locationId ?? undefined,
    )
  }
  if (board.kind === 'LOCATION_CATEGORY' && board.teamSlug) {
    return scopeCanAccessLocationCategoryBoard(
      scope,
      board.teamSlug,
      board.locationId ?? undefined,
    )
  }
  return false
}

async function listRollupCalendarIds(
  db: AycDatabase,
  focus: ResolvedBoard,
): Promise<string[]> {
  const all = await db
    .select({
      id: boards.id,
      kind: boards.kind,
      teamId: boards.teamId,
      locationId: boards.locationId,
      segment: boards.segment,
      parentBoardId: boards.parentBoardId,
    })
    .from(boards)
    .where(and(eq(boards.active, true), isNull(boards.archivedAt)))

  const focusRow = {
    id: focus.id,
    kind: focus.kind,
    teamId: focus.teamId,
    locationId: focus.locationId,
    segment: focus.segment,
    parentBoardId: focus.parentBoardId,
  }
  const boardIds = boardIdsForRollup(focusRow, all)
  if (boardIds.length === 0) return [focus.calendarId]

  const calendarRows = await db
    .select({ id: calendars.id, boardId: calendars.boardId })
    .from(calendars)
    .where(inArray(calendars.boardId, boardIds))

  // Ensure missing calendars for rollup boards.
  const have = new Set(calendarRows.map((row) => row.boardId))
  for (const boardId of boardIds) {
    if (have.has(boardId)) continue
    const board = all.find((row) => row.id === boardId)
    if (!board) continue
    const [named] = await db
      .select({ name: boards.name })
      .from(boards)
      .where(eq(boards.id, boardId))
      .limit(1)
    await ensureCalendarForBoard(db, boardId, named?.name ?? 'Board')
  }

  const refreshed = await db
    .select({ id: calendars.id })
    .from(calendars)
    .where(inArray(calendars.boardId, boardIds))
  return refreshed.map((row) => row.id)
}

export type ListCalendarEventsInput = {
  boardSlug?: string | null
  locationId?: string | null
  teamSlug?: string | null
  mode?: 'rollup' | 'own'
  from?: string | null
  to?: string | null
  includeCancelled?: boolean
}

export async function listCalendarEvents(
  db: AycDatabase,
  input: ListCalendarEventsInput,
  scope: UnlockScope,
) {
  const board = await resolveBoard(db, input)
  if (!scopeCanAccessResolvedBoard(scope, board)) {
    throw Object.assign(new Error('FORBIDDEN'), {
      code: 'FORBIDDEN' as const,
      message: 'This key cannot open this calendar.',
    })
  }

  const mode = input.mode === 'own' ? 'own' : 'rollup'
  const calendarIds =
    mode === 'own' ? [board.calendarId] : await listRollupCalendarIds(db, board)

  const conditions = [inArray(calendarEvents.sourceCalendarId, calendarIds)]
  if (!input.includeCancelled) {
    conditions.push(ne(calendarEvents.status, 'CANCELLED'))
  }
  if (input.from) {
    conditions.push(gte(calendarEvents.endsAt, new Date(input.from)))
  }
  if (input.to) {
    conditions.push(lte(calendarEvents.startsAt, new Date(input.to)))
  }

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
      visibility: calendarEvents.visibility,
      status: calendarEvents.status,
      sourceCalendarId: calendarEvents.sourceCalendarId,
      createdAt: calendarEvents.createdAt,
      updatedAt: calendarEvents.updatedAt,
      cancelledAt: calendarEvents.cancelledAt,
      calendarName: calendars.name,
      boardId: boards.id,
      boardSlug: boards.slug,
      boardName: boards.name,
      boardKind: boards.kind,
      boardLocationId: boards.locationId,
      boardTeamId: boards.teamId,
    })
    .from(calendarEvents)
    .innerJoin(calendars, eq(calendars.id, calendarEvents.sourceCalendarId))
    .innerJoin(boards, eq(boards.id, calendars.boardId))
    .where(and(...conditions))
    .orderBy(asc(calendarEvents.startsAt))
    .limit(500)

  const teamIds = [
    ...new Set(rows.map((row) => row.boardTeamId).filter(Boolean)),
  ] as string[]
  const teamSlugById = new Map<string, string>()
  if (teamIds.length > 0) {
    const teamRows = await db
      .select({ id: teams.id, slug: teams.slug })
      .from(teams)
      .where(inArray(teams.id, teamIds))
    for (const team of teamRows) teamSlugById.set(team.id, team.slug)
  }

  return {
    board,
    mode,
    events: rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      allDay: row.allDay,
      locationText: row.locationText,
      url: row.url,
      visibility: row.visibility,
      status: row.status,
      sourceCalendarId: row.sourceCalendarId,
      sourceBoard: {
        id: row.boardId,
        slug: row.boardSlug,
        name: row.boardName,
        kind: row.boardKind,
        locationId: row.boardLocationId,
        teamSlug: row.boardTeamId ? (teamSlugById.get(row.boardTeamId) ?? null) : null,
      },
      calendarName: row.calendarName,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      cancelledAt: row.cancelledAt?.toISOString() ?? null,
    })),
  }
}

export type UpsertCalendarEventInput = {
  boardSlug?: string | null
  locationId?: string | null
  teamSlug?: string | null
  title?: string
  description?: string | null
  startsAt?: string
  endsAt?: string
  allDay?: boolean
  locationText?: string | null
  url?: string | null
}

export async function createCalendarEvent(
  db: AycDatabase,
  input: UpsertCalendarEventInput,
  scope: UnlockScope,
  actor: ActorContext,
) {
  const board = await resolveBoard(db, input)
  if (!scopeCanAccessResolvedBoard(scope, board)) {
    throw Object.assign(new Error('FORBIDDEN'), {
      code: 'FORBIDDEN' as const,
      message: 'This key cannot write to this calendar.',
    })
  }

  const title = input.title?.trim() ?? ''
  if (!title) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { title: 'Required' },
    })
  }
  if (!input.startsAt || !input.endsAt) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { startsAt: 'Start and end are required' },
    })
  }
  const startsAt = new Date(input.startsAt)
  const endsAt = new Date(input.endsAt)
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { startsAt: 'Invalid date' },
    })
  }
  if (endsAt < startsAt) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { endsAt: 'End must be after start' },
    })
  }

  const [row] = await db
    .insert(calendarEvents)
    .values({
      sourceCalendarId: board.calendarId,
      title,
      description: input.description?.trim() || null,
      startsAt,
      endsAt,
      allDay: Boolean(input.allDay),
      locationText: input.locationText?.trim() || null,
      url: input.url?.trim() || null,
      visibility: 'INTERNAL',
      status: 'SCHEDULED',
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'CALENDAR_EVENT_CREATED',
    entityType: 'CALENDAR_EVENT',
    entityId: row!.id,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary: `Event “${title}” created on ${board.name}.`,
    metadata: { boardId: board.id, calendarId: board.calendarId },
  })

  return { board, eventId: row!.id }
}

export async function updateCalendarEvent(
  db: AycDatabase,
  eventId: string,
  input: UpsertCalendarEventInput & { status?: 'SCHEDULED' | 'CANCELLED' },
  scope: UnlockScope,
  actor: ActorContext,
) {
  const [existing] = await db
    .select({
      id: calendarEvents.id,
      sourceCalendarId: calendarEvents.sourceCalendarId,
      title: calendarEvents.title,
      boardId: boards.id,
      boardSlug: boards.slug,
      boardName: boards.name,
      boardKind: boards.kind,
      boardLocationId: boards.locationId,
      boardTeamId: boards.teamId,
      boardSegment: boards.segment,
      boardParentId: boards.parentBoardId,
      calendarId: calendars.id,
      calendarName: calendars.name,
    })
    .from(calendarEvents)
    .innerJoin(calendars, eq(calendars.id, calendarEvents.sourceCalendarId))
    .innerJoin(boards, eq(boards.id, calendars.boardId))
    .where(eq(calendarEvents.id, eventId))
    .limit(1)

  if (!existing) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Event not found.',
    })
  }

  let teamSlug: string | null = null
  if (existing.boardTeamId) {
    const [team] = await db
      .select({ slug: teams.slug })
      .from(teams)
      .where(eq(teams.id, existing.boardTeamId))
      .limit(1)
    teamSlug = team?.slug ?? null
  }
  let locationType: string | null = null
  if (existing.boardLocationId) {
    const [location] = await db
      .select({ locationType: locations.locationType })
      .from(locations)
      .where(eq(locations.id, existing.boardLocationId))
      .limit(1)
    locationType = location?.locationType ?? null
  }

  const board: ResolvedBoard = {
    id: existing.boardId,
    kind: existing.boardKind,
    slug: existing.boardSlug,
    name: existing.boardName,
    teamId: existing.boardTeamId,
    teamSlug,
    locationId: existing.boardLocationId,
    locationType,
    segment: existing.boardSegment,
    parentBoardId: existing.boardParentId,
    calendarId: existing.calendarId,
    calendarName: existing.calendarName,
    path: boardPath({
      kind: existing.boardKind,
      slug: existing.boardSlug,
      locationId: existing.boardLocationId,
      teamSlug,
    }),
  }

  if (!scopeCanAccessResolvedBoard(scope, board)) {
    throw Object.assign(new Error('FORBIDDEN'), {
      code: 'FORBIDDEN' as const,
      message: 'This key cannot edit this calendar event.',
    })
  }

  const patch: Partial<typeof calendarEvents.$inferInsert> = {
    updatedAt: new Date(),
  }
  if (input.title !== undefined) {
    const title = input.title.trim()
    if (!title) {
      throw Object.assign(new Error('VALIDATION_ERROR'), {
        code: 'VALIDATION_ERROR' as const,
        fields: { title: 'Required' },
      })
    }
    patch.title = title
  }
  if (input.description !== undefined) {
    patch.description = input.description?.trim() || null
  }
  if (input.locationText !== undefined) {
    patch.locationText = input.locationText?.trim() || null
  }
  if (input.url !== undefined) patch.url = input.url?.trim() || null
  if (input.allDay !== undefined) patch.allDay = Boolean(input.allDay)
  if (input.startsAt) {
    const startsAt = new Date(input.startsAt)
    if (Number.isNaN(startsAt.getTime())) {
      throw Object.assign(new Error('VALIDATION_ERROR'), {
        code: 'VALIDATION_ERROR' as const,
        fields: { startsAt: 'Invalid date' },
      })
    }
    patch.startsAt = startsAt
  }
  if (input.endsAt) {
    const endsAt = new Date(input.endsAt)
    if (Number.isNaN(endsAt.getTime())) {
      throw Object.assign(new Error('VALIDATION_ERROR'), {
        code: 'VALIDATION_ERROR' as const,
        fields: { endsAt: 'Invalid date' },
      })
    }
    patch.endsAt = endsAt
  }
  if (input.status === 'CANCELLED') {
    patch.status = 'CANCELLED'
    patch.cancelledAt = new Date()
  } else if (input.status === 'SCHEDULED') {
    patch.status = 'SCHEDULED'
    patch.cancelledAt = null
  }

  const [row] = await db
    .update(calendarEvents)
    .set(patch)
    .where(eq(calendarEvents.id, eventId))
    .returning()

  await insertAuditEvent(db, {
    eventType:
      input.status === 'CANCELLED'
        ? 'CALENDAR_EVENT_CANCELLED'
        : 'CALENDAR_EVENT_UPDATED',
    entityType: 'CALENDAR_EVENT',
    entityId: eventId,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary:
      input.status === 'CANCELLED'
        ? `Event “${row?.title ?? existing.title}” cancelled on ${board.name}.`
        : `Event “${row?.title ?? existing.title}” updated on ${board.name}.`,
  })

  return { board, eventId }
}
