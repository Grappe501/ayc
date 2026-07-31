import type { Handler } from '@netlify/functions'
import type { ArchiveReason } from '../../server/domain/archiveReasons.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { getContactDetail } from '../../server/repos/peopleDetail.ts'
import { archiveContact } from '../../server/services/contactLifecycle.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  id?: string
  reason?: ArchiveReason
  note?: string | null
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST'])
  }

  return withLeaderDb(event, async (db) => {
    const body = parseJsonBody<Body>(event.body)
    const id = body?.id?.trim()
    if (!id || !body?.reason) {
      return fail('VALIDATION_ERROR', 'Contact id and archive reason are required.')
    }

    try {
      await archiveContact(
        db,
        id,
        body.reason,
        {
          actorType: 'SHARED_LEADER_SESSION',
          actorLabel: 'SHARED_LEADER_SESSION',
          requestId: event.headers['x-nf-request-id'] ?? null,
        },
        body.note,
      )
      const detail = await getContactDetail(db, id)
      return ok({
        status: 'archived',
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
