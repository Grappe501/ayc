import type { Handler } from '@netlify/functions'
import type { RestoreStatus } from '../../server/domain/archiveReasons.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { getContactDetail } from '../../server/repos/peopleDetail.ts'
import { restoreContact } from '../../server/services/contactLifecycle.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  id?: string
  status?: RestoreStatus
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST'])
  }

  return withLeaderDb(event, async (db) => {
    const body = parseJsonBody<Body>(event.body)
    const id = body?.id?.trim()
    if (!id || !body?.status) {
      return fail('VALIDATION_ERROR', 'Contact id and restored status are required.')
    }

    try {
      await restoreContact(db, id, body.status, {
        actorType: 'SHARED_LEADER_SESSION',
        actorLabel: 'SHARED_LEADER_SESSION',
        requestId: event.headers['x-nf-request-id'] ?? null,
      })
      const detail = await getContactDetail(db, id)
      return ok({
        status: 'restored',
        contact: detail,
      })
    } catch (error) {
      const err = error as {
        code?: string
        message?: string
        fields?: Record<string, string>
      }
      if (err.code === 'NOT_FOUND') {
        return fail('NOT_FOUND', err.message ?? 'Contact not found.', 404)
      }
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
