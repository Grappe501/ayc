import type { Handler } from '@netlify/functions'
import { checkRateLimit, clientKey } from '../../server/http/rateLimit.ts'
import { fail, methodNotAllowed, ok, parseJsonBody, rateLimited } from '../../server/http/response.ts'
import { claimPersonAccount } from '../../server/services/accountService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed(['POST'])

  const limited = checkRateLimit(`account-claim:${clientKey(event)}`, 20, 60 * 60_000)
  if (!limited.ok) return rateLimited(limited.retryAfterSec)

  const body = parseJsonBody<{ email?: string; code?: string; password?: string }>(event.body)
  if (!body) return fail('VALIDATION_ERROR', 'Request body must be JSON.')

  return withPublicDb(async (db) => {
    try {
      const result = await claimPersonAccount(db, {
        email: body.email ?? '',
        code: body.code ?? '',
        password: body.password ?? '',
        requestId: event.headers['x-nf-request-id'] ?? null,
      })
      return ok(result, 201)
    } catch (error) {
      const err = error as { code?: string; message?: string; fields?: Record<string, string> }
      if (err.code === 'MISCONFIGURED') {
        return fail('MISCONFIGURED', err.message ?? 'Auth not configured.', 503)
      }
      if (err.code === 'UNAUTHORIZED') {
        return fail('UNAUTHORIZED', err.message ?? 'Invite not accepted.', 401)
      }
      if (err.code === 'VALIDATION_ERROR') {
        return fail('VALIDATION_ERROR', err.message ?? 'Check the fields.', 400, err.fields)
      }
      if (err.code === 'INTERNAL_ERROR') {
        return fail('INTERNAL_ERROR', err.message ?? 'Could not claim account.', 500)
      }
      throw error
    }
  })
}
