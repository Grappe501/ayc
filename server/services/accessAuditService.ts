import { randomUUID } from 'node:crypto'
import { desc, inArray } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { auditEvents } from '../db/schema.ts'
import type { AuditEventType } from '../domain/enums.ts'
import { insertAuditEvent } from '../repos/audit.ts'

export const ACCESS_AUDIT_EVENT_TYPES = [
  'BOARD_UNLOCKED',
  'ACCOUNT_LOGIN',
  'ACCOUNT_CLAIMED',
  'ACCOUNT_INVITED',
  'APPLICATION_ACCEPTED',
  'APPLICATION_DECLINED',
  'ROLE_GRANTED',
  'ROLE_REVOKED',
] as const satisfies readonly AuditEventType[]

export type AccessAuditEventType = (typeof ACCESS_AUDIT_EVENT_TYPES)[number]

export async function recordBoardUnlock(
  db: AycDatabase,
  input: {
    scope: {
      kind: string
      label: string
      teamSlug?: string
      segment?: string
    }
    requestId?: string | null
  },
) {
  const eventId = randomUUID()
  await insertAuditEvent(db, {
    eventType: 'BOARD_UNLOCKED',
    entityType: 'BOARD',
    entityId: eventId,
    actorType: 'SHARED_LEADER_SESSION',
    actorLabel: input.scope.label,
    changeSummary: `Workbench unlocked with ${input.scope.label}.`,
    metadata: {
      scopeKind: input.scope.kind,
      scopeLabel: input.scope.label,
      teamSlug: input.scope.teamSlug ?? null,
      segment: input.scope.segment ?? null,
    },
    requestId: input.requestId,
  })
  return eventId
}

export async function recordAccountLogin(
  db: AycDatabase,
  input: {
    accountId: string
    email: string
    personId: string
    via: 'password' | 'google' | 'session'
    requestId?: string | null
  },
) {
  await insertAuditEvent(db, {
    eventType: 'ACCOUNT_LOGIN',
    entityType: 'USER_ACCOUNT',
    entityId: input.accountId,
    actorType: 'USER',
    actorId: input.accountId,
    actorLabel: input.email,
    changeSummary: `Account login (${input.via}) for ${input.email}.`,
    metadata: {
      personId: input.personId,
      via: input.via,
    },
    requestId: input.requestId,
  })
}

export async function listAccessAuditEvents(
  db: AycDatabase,
  options: { limit?: number } = {},
) {
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 250)
  const rows = await db
    .select({
      id: auditEvents.id,
      eventType: auditEvents.eventType,
      entityType: auditEvents.entityType,
      entityId: auditEvents.entityId,
      actorType: auditEvents.actorType,
      actorId: auditEvents.actorId,
      actorLabel: auditEvents.actorLabel,
      changeSummary: auditEvents.changeSummary,
      metadata: auditEvents.metadata,
      requestId: auditEvents.requestId,
      createdAt: auditEvents.createdAt,
    })
    .from(auditEvents)
    .where(inArray(auditEvents.eventType, [...ACCESS_AUDIT_EVENT_TYPES]))
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit)

  return rows.map((row) => ({
    id: row.id,
    eventType: row.eventType,
    entityType: row.entityType,
    entityId: row.entityId,
    actorType: row.actorType,
    actorId: row.actorId,
    actorLabel: row.actorLabel,
    changeSummary: row.changeSummary,
    metadata: (row.metadata ?? null) as Record<string, unknown> | null,
    requestId: row.requestId,
    createdAt: row.createdAt.toISOString(),
  }))
}
