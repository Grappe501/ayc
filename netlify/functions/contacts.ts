import type { Handler } from '@netlify/functions'
import { desc } from 'drizzle-orm'
import { people } from '../../server/db/schema.ts'
import type { ContactCreateInput } from '../../server/domain/validateContact.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { createContact } from '../../server/services/contactService.ts'
import { listLeaderRoster } from '../../server/services/leaderRoster.ts'
import { withLeaderDb } from './_shared.ts'

type CreateBody = ContactCreateInput & {
  confirmDuplicate?: boolean
  forceCreateDespiteExact?: boolean
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return withLeaderDb(event, async (db) => {
      const view = (event.queryStringParameters?.view ?? 'roster').toLowerCase()

      if (view === 'recent') {
        const rows = await db
          .select({
            id: people.id,
            firstName: people.firstName,
            lastName: people.lastName,
            preferredName: people.preferredName,
            displayName: people.displayName,
            status: people.status,
            createdAt: people.createdAt,
          })
          .from(people)
          .orderBy(desc(people.createdAt))
          .limit(5)
        return ok(rows)
      }

      const result = await listLeaderRoster(db, {
        q: event.queryStringParameters?.q ?? undefined,
        teamSlug: event.queryStringParameters?.team ?? undefined,
        status: event.queryStringParameters?.status ?? undefined,
        gapsOnly: event.queryStringParameters?.gaps === '1',
      })
      return ok(result)
    })
  }

  if (event.httpMethod === 'POST') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<CreateBody>(event.body)
      if (!body) {
        return fail('VALIDATION_ERROR', 'Request body must be JSON.')
      }

      try {
        const result = await createContact(db, body, {
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

        return ok(result, 201)
      } catch (error) {
        const err = error as { code?: string; fields?: Record<string, string> }
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

  return methodNotAllowed(['GET', 'POST'])
}
