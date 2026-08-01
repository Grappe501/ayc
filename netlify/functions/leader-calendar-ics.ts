import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { fail, methodNotAllowed } from '../../server/http/response.ts'
import { exportCalendarIcs } from '../../server/services/calendarIcsService.ts'
import { withPublicDb } from './_shared.ts'

function unauthorized() {
  return fail(
    'UNAUTHORIZED',
    'That access code was not accepted. Please check it and try again.',
    401,
  )
}

function misconfigured() {
  return fail(
    'MISCONFIGURED',
    'Leader write access is not configured on this environment.',
    503,
  )
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  const auth = requireLeaderWriteAccess(event)
  if (!auth.ok) {
    return auth.reason === 'misconfigured' ? misconfigured() : unauthorized()
  }

  return withPublicDb(async (db) => {
    const params = event.queryStringParameters ?? {}
    try {
      const result = await exportCalendarIcs(
        db,
        {
          boardSlug: params.board ?? params.boardSlug ?? null,
          locationId: params.locationId ?? null,
          teamSlug: params.teamSlug ?? null,
          mode: params.mode === 'own' ? 'own' : 'rollup',
          from: params.from ?? null,
          to: params.to ?? null,
        },
        auth.scope,
      )

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
          'Cache-Control': 'no-store',
        },
        body: result.body,
      }
    } catch (error) {
      const err = error as { code?: string; message?: string; fields?: Record<string, string> }
      if (err.code === 'NOT_FOUND') {
        return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
      }
      if (err.code === 'FORBIDDEN') {
        return fail('FORBIDDEN', err.message ?? 'Forbidden.', 403)
      }
      if (err.code === 'VALIDATION_ERROR') {
        return fail('VALIDATION_ERROR', 'Check the highlighted fields.', 400, err.fields)
      }
      throw error
    }
  })
}
