import type { Handler } from '@netlify/functions'
import { checkRateLimit, clientKey } from '../../server/http/rateLimit.ts'
import {
  fail,
  methodNotAllowed,
  ok,
  parseJsonBody,
  rateLimited,
} from '../../server/http/response.ts'
import {
  submitJoinApplication,
  type JoinApplicationRequest,
} from '../../server/services/joinService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST'])
  }

  const limited = checkRateLimit(`join:${clientKey(event)}`, 20, 60 * 60_000)
  if (!limited.ok) return rateLimited(limited.retryAfterSec)

  const body = parseJsonBody<JoinApplicationRequest>(event.body)
  if (!body) {
    return fail('VALIDATION_ERROR', 'Request body must be JSON.')
  }

  return withPublicDb(async (db) => {
    try {
      const result = await submitJoinApplication(db, body)
      return ok(result, 201)
    } catch (error) {
      const err = error as {
        code?: string
        fields?: Record<string, string>
        message?: string
      }
      if (err.code === 'VALIDATION_ERROR') {
        return fail(
          'VALIDATION_ERROR',
          'Please review the highlighted fields.',
          400,
          err.fields,
        )
      }
      if (err.code === 'MISCONFIGURED') {
        return fail('MISCONFIGURED', err.message ?? 'Join is not available.', 503)
      }
      throw error
    }
  })
}
