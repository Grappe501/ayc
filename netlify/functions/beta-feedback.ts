import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  submitFeedback,
  type SubmitFeedbackRequest,
} from '../../server/services/feedbackService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST'])
  }

  const body = parseJsonBody<SubmitFeedbackRequest>(event.body)
  if (!body) {
    return fail('VALIDATION_ERROR', 'Request body must be JSON.')
  }

  return withPublicDb(async (db) => {
    try {
      const result = await submitFeedback(db, body)
      return ok(result, 201)
    } catch (error) {
      const err = error as { code?: string; fields?: Record<string, string> }
      if (err.code === 'VALIDATION_ERROR') {
        return fail(
          'VALIDATION_ERROR',
          'Please review the highlighted fields.',
          400,
          err.fields,
        )
      }
      throw error
    }
  })
}
