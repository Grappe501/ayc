import type { Handler } from '@netlify/functions'
import type { PreferredContactMethod } from '../../server/domain/enums.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { updateContactFlags } from '../../server/services/contactFlags.ts'
import { withLeaderDb } from './_shared.ts'

type FlagsBody = {
  id?: string
  preferredContactMethod?: PreferredContactMethod | null
  textReady?: boolean | null
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST') {
    return methodNotAllowed(['PATCH', 'POST'])
  }

  return withLeaderDb(event, async (db) => {
    const body = parseJsonBody<FlagsBody>(event.body)
    if (!body?.id) {
      return fail('VALIDATION_ERROR', 'Contact id is required.')
    }

    try {
      const contact = await updateContactFlags(
        db,
        body.id,
        {
          preferredContactMethod: body.preferredContactMethod,
          textReady: body.textReady,
        },
        {
          actorType: 'SHARED_LEADER_SESSION',
          actorLabel: 'SHARED_LEADER_SESSION',
          requestId: event.headers['x-nf-request-id'] ?? null,
        },
      )
      return ok({ status: 'updated', contact })
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
        return fail('VALIDATION_ERROR', 'Could not update contact flags.', 400, err.fields)
      }
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not update contact flags.', 500)
    }
  })
}
