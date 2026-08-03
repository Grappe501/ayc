import type { Handler } from '@netlify/functions'
import { requirePersonSession } from '../../server/http/personAuth.ts'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import { recordAccountLogin } from '../../server/services/accessAuditService.ts'
import { getMePayload, touchAccountLogin } from '../../server/services/accountService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed(['GET'])

  return withPublicDb(async (db) => {
    const auth = await requirePersonSession(db, event)
    if (!auth.ok) {
      if (auth.reason === 'misconfigured') {
        return fail('MISCONFIGURED', 'Supabase Auth is not configured on this environment.', 503)
      }
      if (auth.reason === 'disabled') {
        return fail('FORBIDDEN', 'This account has been disabled.', 403)
      }
      return fail('UNAUTHORIZED', 'Please log in to continue.', 401)
    }

    const touch = await touchAccountLogin(db, auth.session.accountId)
    if (touch.shouldAuditLogin) {
      try {
        await recordAccountLogin(db, {
          accountId: auth.session.accountId,
          email: auth.session.email,
          personId: auth.session.personId,
          via: 'session',
          requestId: event.headers['x-nf-request-id'] ?? null,
        })
      } catch (error) {
        console.error('account login audit failed', error)
      }
    }

    const me = await getMePayload(db, auth.session.personId)
    if (!me) return fail('NOT_FOUND', 'Account not found.', 404)
    return ok(me)
  })
}
