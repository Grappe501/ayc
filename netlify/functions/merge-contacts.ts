import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { getContactDetail } from '../../server/repos/peopleDetail.ts'
import { mergePeople } from '../../server/services/mergeService.ts'
import { withLeaderDb } from './_shared.ts'

type MergeBody = {
  survivingPersonId?: string
  mergedPersonId?: string
  reason?: string | null
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST'])
  }

  return withLeaderDb(event, async (db) => {
    const body = parseJsonBody<MergeBody>(event.body)
    if (!body?.survivingPersonId || !body?.mergedPersonId) {
      return fail('VALIDATION_ERROR', 'survivingPersonId and mergedPersonId are required.')
    }

    try {
      const result = await mergePeople(
        db,
        {
          survivingPersonId: body.survivingPersonId,
          mergedPersonId: body.mergedPersonId,
          reason: body.reason,
        },
        {
          actorType: 'SHARED_LEADER_SESSION',
          actorLabel: 'SHARED_LEADER_SESSION',
          requestId: event.headers['x-nf-request-id'] ?? null,
        },
      )

      const contact = await getContactDetail(db, result.survivingPersonId)
      return ok({
        ...result,
        contact,
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
        return fail('VALIDATION_ERROR', 'Could not merge these contacts.', 400, err.fields)
      }
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not merge these contacts.', 500)
    }
  })
}
