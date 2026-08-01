import { and, asc, eq, inArray, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { calendarEventRsvps, people } from '../db/schema.ts'
import {
  emptyRsvpCounts,
  isCalendarRsvpStatus,
  tallyRsvpStatuses,
} from '../domain/calendarRsvp.ts'
import type { CalendarRsvpStatus } from '../domain/enums.ts'
import type { UnlockScope } from '../http/auth.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { getEventWithBoardAccess } from './calendarService.ts'

function serializeRsvp(row: {
  id: string
  eventId: string
  personId: string
  status: string
  notes: string | null
  respondedAt: Date | null
  createdAt: Date
  updatedAt: Date
  firstName: string
  lastName: string
  preferredName: string | null
  personStatus: string
}) {
  return {
    id: row.id,
    eventId: row.eventId,
    personId: row.personId,
    status: row.status,
    notes: row.notes,
    respondedAt: row.respondedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    person: {
      id: row.personId,
      firstName: row.firstName,
      lastName: row.lastName,
      preferredName: row.preferredName,
      displayName:
        row.preferredName?.trim() || `${row.firstName} ${row.lastName}`.trim(),
      status: row.personStatus,
    },
  }
}

export async function listEventRsvps(
  db: AycDatabase,
  eventId: string,
  scope: UnlockScope,
) {
  const { event, board } = await getEventWithBoardAccess(db, eventId, scope, 'view')

  const rows = await db
    .select({
      id: calendarEventRsvps.id,
      eventId: calendarEventRsvps.eventId,
      personId: calendarEventRsvps.personId,
      status: calendarEventRsvps.status,
      notes: calendarEventRsvps.notes,
      respondedAt: calendarEventRsvps.respondedAt,
      createdAt: calendarEventRsvps.createdAt,
      updatedAt: calendarEventRsvps.updatedAt,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      personStatus: people.status,
    })
    .from(calendarEventRsvps)
    .innerJoin(people, eq(people.id, calendarEventRsvps.personId))
    .where(eq(calendarEventRsvps.eventId, eventId))
    .orderBy(asc(people.lastName), asc(people.firstName))

  const counts = tallyRsvpStatuses(rows.map((row) => row.status))

  return {
    event,
    board,
    counts,
    rsvps: rows.map(serializeRsvp),
  }
}

export async function inviteEventRsvps(
  db: AycDatabase,
  eventId: string,
  personIds: string[],
  scope: UnlockScope,
  actor: ActorContext,
) {
  const { event, board } = await getEventWithBoardAccess(db, eventId, scope, 'edit')
  const uniqueIds = [...new Set(personIds.map((id) => id.trim()).filter(Boolean))]
  if (uniqueIds.length === 0) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { personIds: 'Select at least one person' },
    })
  }

  const activePeople = await db
    .select({ id: people.id })
    .from(people)
    .where(and(inArray(people.id, uniqueIds), isNull(people.archivedAt)))
  const found = new Set(activePeople.map((row) => row.id))
  const missing = uniqueIds.filter((id) => !found.has(id))
  if (missing.length > 0) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { personIds: 'One or more people were not found' },
    })
  }

  let invited = 0
  let already = 0
  for (const personId of uniqueIds) {
    const [existing] = await db
      .select({ id: calendarEventRsvps.id })
      .from(calendarEventRsvps)
      .where(
        and(
          eq(calendarEventRsvps.eventId, eventId),
          eq(calendarEventRsvps.personId, personId),
        ),
      )
      .limit(1)
    if (existing) {
      already += 1
      continue
    }
    const [row] = await db
      .insert(calendarEventRsvps)
      .values({
        eventId,
        personId,
        status: 'INVITED',
      })
      .returning()
    invited += 1
    await insertAuditEvent(db, {
      eventType: 'CALENDAR_RSVP_INVITED',
      entityType: 'CALENDAR_RSVP',
      entityId: row!.id,
      actorType: actor.actorType,
      actorLabel: actor.actorLabel,
      changeSummary: `Invited person to “${event.title}” on ${board.name}.`,
      metadata: { eventId, personId },
    })
  }

  const listed = await listEventRsvps(db, eventId, scope)
  return { invited, already, ...listed }
}

export async function setEventRsvpStatus(
  db: AycDatabase,
  input: {
    eventId: string
    personId: string
    status: string
    notes?: string | null
  },
  scope: UnlockScope,
  actor: ActorContext,
) {
  const { event, board } = await getEventWithBoardAccess(
    db,
    input.eventId,
    scope,
    'edit',
  )
  if (!isCalendarRsvpStatus(input.status)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Use INVITED, YES, NO, or MAYBE' },
    })
  }
  const status = input.status as CalendarRsvpStatus

  const [existing] = await db
    .select()
    .from(calendarEventRsvps)
    .where(
      and(
        eq(calendarEventRsvps.eventId, input.eventId),
        eq(calendarEventRsvps.personId, input.personId),
      ),
    )
    .limit(1)

  const respondedAt = status === 'INVITED' ? null : new Date()

  if (!existing) {
    const [row] = await db
      .insert(calendarEventRsvps)
      .values({
        eventId: input.eventId,
        personId: input.personId,
        status,
        notes: input.notes?.trim() || null,
        respondedAt,
      })
      .returning()
    await insertAuditEvent(db, {
      eventType: 'CALENDAR_RSVP_UPDATED',
      entityType: 'CALENDAR_RSVP',
      entityId: row!.id,
      actorType: actor.actorType,
      actorLabel: actor.actorLabel,
      changeSummary: `RSVP ${status} for “${event.title}” on ${board.name}.`,
      metadata: { eventId: input.eventId, personId: input.personId, status },
    })
  } else {
    await db
      .update(calendarEventRsvps)
      .set({
        status,
        notes:
          input.notes !== undefined
            ? input.notes?.trim() || null
            : existing.notes,
        respondedAt,
        updatedAt: new Date(),
      })
      .where(eq(calendarEventRsvps.id, existing.id))
    await insertAuditEvent(db, {
      eventType: 'CALENDAR_RSVP_UPDATED',
      entityType: 'CALENDAR_RSVP',
      entityId: existing.id,
      actorType: actor.actorType,
      actorLabel: actor.actorLabel,
      changeSummary: `RSVP ${status} for “${event.title}” on ${board.name}.`,
      metadata: { eventId: input.eventId, personId: input.personId, status },
    })
  }

  return listEventRsvps(db, input.eventId, scope)
}

export async function removeEventRsvp(
  db: AycDatabase,
  eventId: string,
  personId: string,
  scope: UnlockScope,
  actor: ActorContext,
) {
  const { event, board } = await getEventWithBoardAccess(db, eventId, scope, 'edit')
  const [existing] = await db
    .select()
    .from(calendarEventRsvps)
    .where(
      and(
        eq(calendarEventRsvps.eventId, eventId),
        eq(calendarEventRsvps.personId, personId),
      ),
    )
    .limit(1)
  if (!existing) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'RSVP not found.',
    })
  }

  await db.delete(calendarEventRsvps).where(eq(calendarEventRsvps.id, existing.id))
  await insertAuditEvent(db, {
    eventType: 'CALENDAR_RSVP_REMOVED',
    entityType: 'CALENDAR_RSVP',
    entityId: existing.id,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary: `Removed RSVP from “${event.title}” on ${board.name}.`,
    metadata: { eventId, personId },
  })

  return listEventRsvps(db, eventId, scope)
}

export { emptyRsvpCounts }
