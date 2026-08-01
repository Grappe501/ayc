import type { Handler } from '@netlify/functions'
import { requireBoardWriteAccess } from '../../server/http/boardAccess.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { invitePersonAccount } from '../../server/services/accountService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed(['POST'])

  const body = parseJsonBody<{ personId?: string; email?: string | null }>(event.body)
  if (!body?.personId?.trim()) {
    return fail('VALIDATION_ERROR', 'Person id is required.', 400, { personId: 'Required' })
  }

  return withPublicDb(async (db) => {
    const auth = await requireBoardWriteAccess(db, event)
    if (!auth.ok) {
      return auth.reason === 'misconfigured'
        ? fail('MISCONFIGURED', 'Leader write access is not configured on this environment.', 503)
        : fail('UNAUTHORIZED', 'Log in with a leadership account, or use the emergency board key.', 401)
    }

    const actorLabel =
      auth.mode === 'key' ? auth.scope.label : `account:${auth.personId}`

    try {
      const result = await invitePersonAccount(db, {
        personId: body.personId!.trim(),
        email: body.email,
        actorLabel,
        requestId: event.headers['x-nf-request-id'] ?? null,
      })
      return ok(result, 201)
    } catch (error) {
      const err = error as { code?: string; message?: string; fields?: Record<string, string> }
      if (err.code === 'NOT_FOUND') return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
      if (err.code === 'VALIDATION_ERROR') {
        return fail('VALIDATION_ERROR', err.message ?? 'Check the fields.', 400, err.fields)
      }
      throw error
    }
  })
}
