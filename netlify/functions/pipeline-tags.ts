import type { Handler } from '@netlify/functions'
import { PIPELINE_TAG_LABELS, PIPELINE_TAGS } from '../../server/domain/enums.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { getContactDetail } from '../../server/repos/peopleDetail.ts'
import { setPipelineTags } from '../../server/services/pipelineTagService.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  personId?: string
  tags?: string[]
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return ok({
      tags: PIPELINE_TAGS.map((value) => ({
        value,
        label: PIPELINE_TAG_LABELS[value],
      })),
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      if (!body?.personId) {
        return fail('VALIDATION_ERROR', 'personId is required.')
      }
      if (!Array.isArray(body.tags)) {
        return fail('VALIDATION_ERROR', 'tags must be an array.')
      }

      try {
        const tags = await setPipelineTags(
          db,
          body.personId,
          body.tags,
          {
            actorType: 'SHARED_LEADER_SESSION',
            actorLabel: 'SHARED_LEADER_SESSION',
            requestId: event.headers['x-nf-request-id'] ?? null,
          },
        )
        const contact = await getContactDetail(db, body.personId)
        return ok({ tags, contact })
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
          return fail('VALIDATION_ERROR', 'Could not update pipeline tags.', 400, err.fields)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not update pipeline tags.', 500)
      }
    })
  }

  return methodNotAllowed(['GET', 'PATCH'])
}
