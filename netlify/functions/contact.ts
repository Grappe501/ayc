import type { Handler } from '@netlify/functions'
import type { ContactCreateInput } from '../../server/domain/validateContact.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { getContactDetail } from '../../server/repos/peopleDetail.ts'
import { updateContact } from '../../server/services/contactUpdate.ts'
import { withLeaderDb } from './_shared.ts'

type UpdateBody = ContactCreateInput & {
  confirmDuplicate?: boolean
  forceCreateDespiteExact?: boolean
}

function personIdFromEvent(event: Parameters<Handler>[0]): string | null {
  const id = event.queryStringParameters?.id?.trim()
  return id || null
}

export const handler: Handler = async (event) => {
  const personId = personIdFromEvent(event)
  if (!personId) {
    return fail('VALIDATION_ERROR', 'Contact id is required.')
  }

  if (event.httpMethod === 'GET') {
    return withLeaderDb(event, async (db) => {
      const detail = await getContactDetail(db, personId)
      if (!detail) {
        return fail('NOT_FOUND', 'Contact not found.', 404)
      }
      return ok(detail)
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<UpdateBody>(event.body)
      if (!body) {
        return fail('VALIDATION_ERROR', 'Request body must be JSON.')
      }

      try {
        const result = await updateContact(db, personId, body, {
          actorType: 'SHARED_LEADER_SESSION',
          actorLabel: 'SHARED_LEADER_SESSION',
          requestId: event.headers['x-nf-request-id'] ?? null,
        })

        if (result.status === 'duplicate_review') {
          return fail(
            'DUPLICATE_CONTACT',
            result.result === 'EXACT_MATCH'
              ? 'This contact already appears to exist.'
              : result.result === 'LIKELY_MATCH'
                ? 'This person may already be in the directory.'
                : 'We found a possible match.',
            409,
            undefined,
            {
              duplicateResult: result.result,
              candidates: result.candidates,
              reasons: result.reasons,
            },
          )
        }

        const detail = await getContactDetail(db, personId)
        return ok({
          status: 'updated',
          personId: result.personId,
          displayName: result.displayName,
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

  return methodNotAllowed(['GET', 'PATCH'])
}
