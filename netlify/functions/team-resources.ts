import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  createTeamResource,
  listTeamResources,
  updateTeamResource,
} from '../../server/services/teamResourceService.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  team?: string
  id?: string
  title?: string
  url?: string | null
  notes?: string | null
  kind?: string
  archive?: boolean
}

function actorFrom(event: Parameters<Handler>[0]) {
  return {
    actorType: 'SHARED_LEADER_SESSION' as const,
    actorLabel: 'SHARED_LEADER_SESSION',
    requestId: event.headers['x-nf-request-id'] ?? null,
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const team = event.queryStringParameters?.team?.trim()
    if (!team) {
      return fail('VALIDATION_ERROR', 'team query parameter is required.')
    }
    return withLeaderDb(event, async (db) => {
      try {
        return ok(await listTeamResources(db, team))
      } catch (error) {
        const err = error as { code?: string; message?: string }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Team not found.', 404)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not load team resources.', 500)
      }
    })
  }

  if (event.httpMethod === 'POST') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      const team = body?.team?.trim()
      if (!team) return fail('VALIDATION_ERROR', 'team is required.')
      try {
        const resource = await createTeamResource(db, team, body ?? {}, actorFrom(event))
        return ok({ status: 'created', resource }, 201)
      } catch (error) {
        const err = error as {
          code?: string
          message?: string
          fields?: Record<string, string>
        }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Team not found.', 404)
        }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Could not create resource.', 400, err.fields)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not create resource.', 500)
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      const id = body?.id?.trim()
      if (!id) return fail('VALIDATION_ERROR', 'Resource id is required.')
      try {
        const resource = await updateTeamResource(db, id, body ?? {}, actorFrom(event))
        return ok({ status: body?.archive ? 'archived' : 'updated', resource })
      } catch (error) {
        const err = error as {
          code?: string
          message?: string
          fields?: Record<string, string>
        }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Resource not found.', 404)
        }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Could not update resource.', 400, err.fields)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not update resource.', 500)
      }
    })
  }

  return methodNotAllowed(['GET', 'POST', 'PATCH'])
}
