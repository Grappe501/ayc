import type { Handler } from '@netlify/functions'
import { verifyUnlockCode } from '../../server/http/auth.ts'
import { checkRateLimit, clientKey } from '../../server/http/rateLimit.ts'
import { fail, ok, parseJsonBody, rateLimited } from '../../server/http/response.ts'
import { recordBoardUnlock } from '../../server/services/accessAuditService.ts'
import { withPublicDb } from './_shared.ts'

type Body = { code?: string }

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return fail('VALIDATION_ERROR', 'Use POST.', 405)
  }

  const limited = checkRateLimit(`unlock:${clientKey(event)}`, 20, 15 * 60_000)
  if (!limited.ok) return rateLimited(limited.retryAfterSec)

  const body = parseJsonBody<Body>(event.body)
  const code = body?.code?.trim() ?? ''
  const result = verifyUnlockCode(code)

  if (!result.ok) {
    // Same message for misconfigured and wrong code — do not leak config state.
    return fail(
      'UNAUTHORIZED',
      'That access code was not accepted. Please check it and try again.',
      401,
    )
  }

  return withPublicDb(async (db) => {
    try {
      await recordBoardUnlock(db, {
        scope: result.scope,
        requestId: event.headers['x-nf-request-id'] ?? null,
      })
    } catch (error) {
      console.error('board unlock audit failed', error)
      // Unlock still succeeds — audit must not block access.
    }
    return ok({ unlocked: true, scope: result.scope })
  })
}
