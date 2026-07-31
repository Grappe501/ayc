import { and, eq } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  ARCHIVE_REASONS,
  ARCHIVE_REASON_LABELS,
  RESTORE_STATUSES,
  type ArchiveReason,
  type RestoreStatus,
} from '../domain/archiveReasons.ts'
import { people } from '../db/schema.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { getContactDetail } from '../repos/peopleDetail.ts'

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

export async function archiveContact(
  db: AycDatabase,
  personId: string,
  reason: ArchiveReason,
  actor: ActorContext,
  note?: string | null,
) {
  if (!(ARCHIVE_REASONS as readonly string[]).includes(reason)) {
    throw validationError({ reason: 'Select a valid archive reason.' })
  }

  const detail = await getContactDetail(db, personId)
  if (!detail) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Contact not found.',
    })
  }
  if (detail.status === 'ARCHIVED') {
    throw validationError({ status: 'This contact is already archived.' })
  }

  const [person] = await db
    .update(people)
    .set({
      status: 'ARCHIVED',
      archivedAt: new Date(),
      updatedAt: new Date(),
      updatedByActor: actor.actorLabel ?? actor.actorType,
    })
    .where(and(eq(people.id, personId)))
    .returning()

  await insertAuditEvent(db, {
    eventType: 'PERSON_ARCHIVED',
    entityType: 'PERSON',
    entityId: personId,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Archived contact ${detail.displayName ?? detail.firstName}.`,
    metadata: {
      reason,
      reasonLabel: ARCHIVE_REASON_LABELS[reason],
      previousStatus: detail.status,
      note: note?.trim() || null,
    },
    requestId: actor.requestId,
  })

  return person
}

export async function restoreContact(
  db: AycDatabase,
  personId: string,
  status: RestoreStatus,
  actor: ActorContext,
) {
  if (!(RESTORE_STATUSES as readonly string[]).includes(status)) {
    throw validationError({ status: 'Select Active, Prospective, or Inactive.' })
  }

  const detail = await getContactDetail(db, personId)
  if (!detail) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Contact not found.',
    })
  }
  if (detail.status !== 'ARCHIVED') {
    throw validationError({ status: 'Only archived contacts can be restored.' })
  }

  const [person] = await db
    .update(people)
    .set({
      status,
      archivedAt: null,
      updatedAt: new Date(),
      updatedByActor: actor.actorLabel ?? actor.actorType,
    })
    .where(eq(people.id, personId))
    .returning()

  await insertAuditEvent(db, {
    eventType: 'PERSON_RESTORED',
    entityType: 'PERSON',
    entityId: personId,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Restored contact ${detail.displayName ?? detail.firstName} as ${status}.`,
    metadata: { restoredStatus: status },
    requestId: actor.requestId,
  })

  await insertAuditEvent(db, {
    eventType: 'PERSON_STATUS_CHANGED',
    entityType: 'PERSON',
    entityId: personId,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Status changed from ARCHIVED to ${status}.`,
    metadata: { from: 'ARCHIVED', to: status },
    requestId: actor.requestId,
  })

  return person
}
