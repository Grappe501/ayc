import type { Handler } from '@netlify/functions'
import { requireMasterAccess } from '../../server/http/boardAccess.ts'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import { listAccessAuditEvents } from '../../server/services/accessAuditService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed(['GET'])

  return withPublicDb(async (db) => {
    const auth = await requireMasterAccess(db, event)
    if (!auth.ok) {
      if (auth.reason === 'misconfigured') {
        return fail(
          'MISCONFIGURED',
          'Leader write access is not configured on this environment.',
          503,
        )
      }
      return fail(
        'FORBIDDEN',
        'Access log is limited to the Lead Organizer (master key or LEAD_ORGANIZER account).',
        403,
      )
    }

    const limitRaw = event.queryStringParameters?.limit
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 100
    try {
      const events = await listAccessAuditEvents(db, {
        limit: Number.isFinite(limit) ? limit : 100,
      })
      return ok({ events })
    } catch (error) {
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not load the access log.', 500)
    }
  })
}
