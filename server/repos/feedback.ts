import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { betaFeedback } from '../db/schema.ts'
import {
  FEEDBACK_SEVERITIES,
  FEEDBACK_STATUSES,
  type FeedbackCategory,
  type FeedbackSeverity,
  type FeedbackStatus,
} from '../domain/enums.ts'
import type { ActorContext } from './people.ts'
import { insertAuditEvent } from './audit.ts'

const TERMINAL_STATUSES = new Set<FeedbackStatus>(['RESOLVED', 'DECLINED', 'DUPLICATE'])

/** Screen Bible / Volume IV style: AYC-FB-000128 */
export function buildReferenceCode(seed = Math.floor(Math.random() * 1_000_000)): string {
  const n = Math.abs(seed) % 1_000_000
  return `AYC-FB-${n.toString().padStart(6, '0')}`
}

export type CreateFeedbackInput = {
  category: FeedbackCategory
  description: string
  pagePath?: string | null
  workflow?: string | null
  severity?: FeedbackSeverity | null
  reporterPersonId?: string | null
  reporterName?: string | null
  reporterContact?: string | null
  browserContext?: string | null
}

export async function createBetaFeedback(db: AycDatabase, input: CreateFeedbackInput) {
  const description = input.description.trim()
  if (!description) {
    throw new Error('Feedback description is required')
  }

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(betaFeedback)
      .values({
        referenceCode: buildReferenceCode(),
        category: input.category,
        pagePath: input.pagePath ?? null,
        workflow: input.workflow ?? null,
        description,
        severity: input.severity ?? null,
        status: 'NEW',
        reporterPersonId: input.reporterPersonId ?? null,
        reporterName: input.reporterName?.trim() || null,
        reporterContact: input.reporterContact?.trim() || null,
        browserContext: input.browserContext ?? null,
      })
      .returning()

    await insertAuditEvent(tx, {
      eventType: 'BETA_FEEDBACK_SUBMITTED',
      entityType: 'BETA_FEEDBACK',
      entityId: row.id,
      actorType: 'SYSTEM',
      changeSummary: `Beta feedback submitted (${row.referenceCode}).`,
      metadata: { category: row.category, pagePath: row.pagePath },
    })

    return row
  })
}

export async function getFeedbackByReference(db: AycDatabase, referenceCode: string) {
  const rows = await db
    .select()
    .from(betaFeedback)
    .where(eq(betaFeedback.referenceCode, referenceCode))
    .limit(1)
  return rows[0] ?? null
}

export async function getFeedbackById(db: AycDatabase, id: string) {
  const rows = await db.select().from(betaFeedback).where(eq(betaFeedback.id, id)).limit(1)
  return rows[0] ?? null
}

export async function listRecentFeedback(db: AycDatabase, limit = 50) {
  return listFeedback(db, { limit })
}

export type ListFeedbackFilters = {
  status?: string
  q?: string
  limit?: number
}

export async function listFeedback(db: AycDatabase, filters: ListFeedbackFilters = {}) {
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 200)
  const clauses = []

  if (filters.status && filters.status !== 'ALL') {
    if (!(FEEDBACK_STATUSES as readonly string[]).includes(filters.status)) {
      throw Object.assign(new Error('VALIDATION_ERROR'), {
        code: 'VALIDATION_ERROR' as const,
        fields: { status: 'Choose a valid feedback status.' },
      })
    }
    clauses.push(eq(betaFeedback.status, filters.status))
  }

  if (filters.q?.trim()) {
    const q = `%${filters.q.trim()}%`
    clauses.push(
      or(
        ilike(betaFeedback.referenceCode, q),
        ilike(betaFeedback.description, q),
        ilike(betaFeedback.reporterName, q),
        ilike(betaFeedback.pagePath, q),
        ilike(betaFeedback.category, q),
      ),
    )
  }

  const rows = await db
    .select()
    .from(betaFeedback)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(desc(betaFeedback.createdAt))
    .limit(limit)

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(betaFeedback)

  const [{ openCount }] = await db
    .select({ openCount: sql<number>`count(*)::int` })
    .from(betaFeedback)
    .where(
      sql`${betaFeedback.status} not in ('RESOLVED', 'DECLINED', 'DUPLICATE')`,
    )

  return {
    total: Number(total),
    openCount: Number(openCount),
    items: rows,
  }
}

export type UpdateFeedbackInput = {
  status?: FeedbackStatus
  severity?: FeedbackSeverity | null
  resolutionSummary?: string | null
}

export async function updateBetaFeedback(
  db: AycDatabase,
  id: string,
  input: UpdateFeedbackInput,
  actor: ActorContext,
) {
  const existing = await getFeedbackById(db, id)
  if (!existing) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Feedback item was not found.',
    })
  }

  if (input.status && !(FEEDBACK_STATUSES as readonly string[]).includes(input.status)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Choose a valid feedback status.' },
    })
  }

  if (
    input.severity !== undefined &&
    input.severity !== null &&
    !(FEEDBACK_SEVERITIES as readonly string[]).includes(input.severity)
  ) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { severity: 'Choose a valid severity.' },
    })
  }

  const nextStatus = (input.status ?? existing.status) as FeedbackStatus
  const note =
    input.resolutionSummary === undefined
      ? existing.resolutionSummary
      : input.resolutionSummary?.trim() || null

  const resolvedAt = TERMINAL_STATUSES.has(nextStatus)
    ? existing.resolvedAt ?? new Date()
    : null

  const [row] = await db
    .update(betaFeedback)
    .set({
      status: nextStatus,
      severity: input.severity === undefined ? existing.severity : input.severity,
      resolutionSummary: note,
      resolvedAt,
      updatedAt: new Date(),
    })
    .where(eq(betaFeedback.id, id))
    .returning()

  // Note: Phase 1 audit enum is submit-only; triage updates are tracked on the row.
  void actor

  return row
}
