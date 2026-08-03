import type { Handler } from '@netlify/functions'
import { extractBearerToken } from '../../server/http/personAuth.ts'
import { checkRateLimit, clientKey } from '../../server/http/rateLimit.ts'
import { fail, methodNotAllowed, ok, rateLimited } from '../../server/http/response.ts'
import { bindOAuthAccount } from '../../server/services/accountService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed(['POST'])

  const limited = checkRateLimit(`account-oauth-bind:${clientKey(event)}`, 30, 60 * 60_000)
  if (!limited.ok) return rateLimited(limited.retryAfterSec)

  const token = extractBearerToken(event)
  if (!token) {
    return fail('UNAUTHORIZED', 'Missing Google session. Please try signing in again.', 401)
  }

  return withPublicDb(async (db) => {
    try {
      const result = await bindOAuthAccount(db, {
        accessToken: token,
        requestId: event.headers['x-nf-request-id'] ?? null,
      })
      return ok(result)
    } catch (err) {
      const code = (err as { code?: string }).code
      const message = (err as Error).message
      if (code === 'MISCONFIGURED') {
        return fail('MISCONFIGURED', message, 503)
      }
      if (code === 'FORBIDDEN') {
        return fail('FORBIDDEN', message, 403)
      }
      if (code === 'UNAUTHORIZED') {
        return fail('UNAUTHORIZED', message, 401)
      }
      if (code === 'VALIDATION_ERROR') {
        return fail('VALIDATION_ERROR', message, 400)
      }
      return fail('INTERNAL_ERROR', message || 'Could not complete Google sign-in.', 500)
    }
  })
}
