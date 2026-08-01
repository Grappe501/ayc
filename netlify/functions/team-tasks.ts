import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  createTeamTask,
  listTeamTasks,
  updateTeamTask,
} from '../../server/services/teamTaskService.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  team?: string
  locationId?: string | null
  id?: string
  title?: string
  notes?: string | null
  status?: string
  priority?: string
  dueOn?: string | null
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
    const locationId = event.queryStringParameters?.locationId?.trim() || null
    if (!team) {
      return fail('VALIDATION_ERROR', 'team query parameter is required.')
    }
    return withLeaderDb(event, async (db) => {
      try {
        const result = await listTeamTasks(db, team, locationId)
        return ok(result)
      } catch (error) {
        const err = error as { code?: string; message?: string }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Team not found.', 404)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not load team tasks.', 500)
      }
    })
  }

  if (event.httpMethod === 'POST') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      const team = body?.team?.trim()
      const locationId = body?.locationId?.trim() || null
      if (!team) {
        return fail('VALIDATION_ERROR', 'team is required.')
      }
      try {
        const task = await createTeamTask(db, team, body ?? {}, actorFrom(event), locationId)
        return ok({ status: 'created', task }, 201)
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
          return fail('VALIDATION_ERROR', 'Could not create task.', 400, err.fields)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not create task.', 500)
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      const id = body?.id?.trim()
      if (!id) {
        return fail('VALIDATION_ERROR', 'Task id is required.')
      }
      try {
        const task = await updateTeamTask(db, id, body ?? {}, actorFrom(event))
        return ok({ status: 'updated', task })
      } catch (error) {
        const err = error as {
          code?: string
          message?: string
          fields?: Record<string, string>
        }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Task not found.', 404)
        }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Could not update task.', 400, err.fields)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not update task.', 500)
      }
    })
  }

  return methodNotAllowed(['GET', 'POST', 'PATCH'])
}
