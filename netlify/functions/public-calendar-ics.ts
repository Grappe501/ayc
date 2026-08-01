import type { Handler } from '@netlify/functions'
import { checkRateLimit, clientKey } from '../../server/http/rateLimit.ts'
import { fail, methodNotAllowed, rateLimited } from '../../server/http/response.ts'
import { exportPublicCalendarIcs } from '../../server/services/publicCalendarService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  const limited = checkRateLimit(`public-ics:${clientKey(event)}`, 60, 60 * 60_000)
  if (!limited.ok) return rateLimited(limited.retryAfterSec)

  return withPublicDb(async (db) => {
    try {
      const params = event.queryStringParameters ?? {}
      const result = await exportPublicCalendarIcs(db, {
        from: params.from ?? null,
        to: params.to ?? null,
      })
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
          'Cache-Control': 'public, max-age=300',
        },
        body: result.body,
      }
    } catch (error) {
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not export the public calendar.', 500)
    }
  })
}
