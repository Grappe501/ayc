import { desc, eq } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { betaFeedback } from '../db/schema.ts'
import type { FeedbackCategory, FeedbackSeverity } from '../domain/enums.ts'
import { insertAuditEvent } from './audit.ts'

function buildReferenceCode(now = new Date()): string {
  const stamp = now.toISOString().slice(0, 10).replaceAll('-', '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FB-${stamp}-${rand}`
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

export async function listRecentFeedback(db: AycDatabase, limit = 50) {
  return db.select().from(betaFeedback).orderBy(desc(betaFeedback.createdAt)).limit(limit)
}
