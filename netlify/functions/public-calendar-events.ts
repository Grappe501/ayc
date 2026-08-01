import type { Handler } from '@netlify/functions'
import { checkRateLimit, clientKey } from '../../server/http/rateLimit.ts'
import { fail, methodNotAllowed, ok, rateLimited } from '../../server/http/response.ts'
import { listPublicCalendarEvents } from '../../server/services/publicCalendarService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  const limited = checkRateLimit(`public-cal:${clientKey(event)}`, 120, 60 * 60_000)
  if (!limited.ok) return rateLimited(limited.retryAfterSec)

  return withPublicDb(async (db) => {
    try {
      const params = event.queryStringParameters ?? {}
      const result = await listPublicCalendarEvents(db, {
        from: params.from ?? null,
        to: params.to ?? null,
      })
      return ok(result)
    } catch (error) {
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not load the public calendar.', 500)
    }
  })
}
