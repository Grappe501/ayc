import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  FEEDBACK_SEVERITIES,
  FEEDBACK_STATUSES,
  type FeedbackSeverity,
  type FeedbackStatus,
} from '../../server/domain/enums.ts'
import { getFeedbackById, listFeedback, updateBetaFeedback } from '../../server/repos/feedback.ts'
import { withLeaderDb } from './_shared.ts'

function serialize(row: Awaited<ReturnType<typeof getFeedbackById>>) {
  if (!row) return null
  return {
    id: row.id,
    referenceCode: row.referenceCode,
    category: row.category,
    pagePath: row.pagePath,
    workflow: row.workflow,
    description: row.description,
    severity: row.severity,
    status: row.status,
    reporterName: row.reporterName,
    reporterContact: row.reporterContact,
    browserContext: row.browserContext,
    resolutionSummary: row.resolutionSummary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return withLeaderDb(event, async (db) => {
      const params = event.queryStringParameters ?? {}
      try {
        const result = await listFeedback(db, {
          status: params.status ?? undefined,
          q: params.q ?? undefined,
          limit: params.limit ? Number(params.limit) : 100,
        })
        return ok({
          total: result.total,
          openCount: result.openCount,
          items: result.items.map((row) => serialize(row)),
        })
      } catch (error) {
        const err = error as { code?: string; fields?: Record<string, string>; message?: string }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Check the highlighted fields.', 400, err.fields)
        }
        throw error
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<{
        id?: string
        status?: string
        severity?: string | null
        resolutionSummary?: string | null
      }>(event.body)
      if (!body?.id?.trim()) {
        return fail('VALIDATION_ERROR', 'Feedback id is required.', 400, {
          id: 'Required',
        })
      }

      if (body.status && !(FEEDBACK_STATUSES as readonly string[]).includes(body.status)) {
        return fail('VALIDATION_ERROR', 'Choose a valid status.', 400, {
          status: 'Invalid status',
        })
      }
      if (
        body.severity !== undefined &&
        body.severity !== null &&
        !(FEEDBACK_SEVERITIES as readonly string[]).includes(body.severity)
      ) {
        return fail('VALIDATION_ERROR', 'Choose a valid severity.', 400, {
          severity: 'Invalid severity',
        })
      }

      try {
        const row = await updateBetaFeedback(
          db,
          body.id.trim(),
          {
            status: body.status as FeedbackStatus | undefined,
            severity:
              body.severity === undefined
                ? undefined
                : ((body.severity as FeedbackSeverity | null) ?? null),
            resolutionSummary: body.resolutionSummary,
          },
          {
            actorType: 'SHARED_LEADER_SESSION',
            actorId: 'leader-write',
            actorLabel: 'AYC Leader',
          },
        )
        return ok({ item: serialize(row) })
      } catch (error) {
        const err = error as {
          code?: string
          fields?: Record<string, string>
          message?: string
        }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
        }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Check the highlighted fields.', 400, err.fields)
        }
        throw error
      }
    })
  }

  return methodNotAllowed(['GET', 'PATCH'])
}
