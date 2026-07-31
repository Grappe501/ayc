import type { AycDatabase } from '../db/client.ts'
import { auditEvents } from '../db/schema.ts'
import type { ActorType, AuditEntityType, AuditEventType } from '../domain/enums.ts'

export type AuditInsert = {
  eventType: AuditEventType
  entityType: AuditEntityType
  entityId: string
  actorType: ActorType
  actorId?: string | null
  actorLabel?: string | null
  changeSummary: string
  metadata?: Record<string, unknown> | null
  requestId?: string | null
}

type DbLike = Pick<AycDatabase, 'insert'>

export async function insertAuditEvent(db: DbLike, event: AuditInsert) {
  const [row] = await db
    .insert(auditEvents)
    .values({
      eventType: event.eventType,
      entityType: event.entityType,
      entityId: event.entityId,
      actorType: event.actorType,
      actorId: event.actorId ?? null,
      actorLabel: event.actorLabel ?? null,
      changeSummary: event.changeSummary,
      metadata: event.metadata ?? null,
      requestId: event.requestId ?? null,
    })
    .returning()
  return row
}

export async function listAuditEventsForEntity(
  db: AycDatabase,
  entityType: AuditEntityType,
  entityId: string,
) {
  return db.query.auditEvents.findMany({
    where: (fields, { and, eq }) =>
      and(eq(fields.entityType, entityType), eq(fields.entityId, entityId)),
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  })
}
