import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  inviteEventRsvps,
  listEventRsvps,
  removeEventRsvp,
  setEventRsvpStatus,
} from '../../server/services/calendarRsvpService.ts'
import { withPublicDb } from './_shared.ts'

function unauthorized() {
  return fail(
    'UNAUTHORIZED',
    'That access code was not accepted. Please check it and try again.',
    401,
  )
}

function misconfigured() {
  return fail(
    'MISCONFIGURED',
    'Leader write access is not configured on this environment.',
    503,
  )
}

function mapError(error: unknown) {
  const err = error as { code?: string; message?: string; fields?: Record<string, string> }
  if (err.code === 'NOT_FOUND') {
    return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
  }
  if (err.code === 'FORBIDDEN') {
    return fail('FORBIDDEN', err.message ?? 'Forbidden.', 403)
  }
  if (err.code === 'VALIDATION_ERROR') {
    return fail('VALIDATION_ERROR', 'Check the highlighted fields.', 400, err.fields)
  }
  return null
}

export const handler: Handler = async (event) => {
  const auth = requireLeaderWriteAccess(event)
  if (!auth.ok) {
    return auth.reason === 'misconfigured' ? misconfigured() : unauthorized()
  }

  const actor = {
    actorType: 'SHARED_LEADER_SESSION' as const,
    actorLabel: auth.scope.label,
    requestId: event.headers['x-nf-request-id'] ?? null,
  }

  if (event.httpMethod === 'GET') {
    return withPublicDb(async (db) => {
      const eventId = event.queryStringParameters?.eventId?.trim()
      if (!eventId) {
        return fail('VALIDATION_ERROR', 'eventId is required.', 400, {
          eventId: 'Required',
        })
      }
      try {
        const result = await listEventRsvps(db, eventId, auth.scope)
        return ok(result)
      } catch (error) {
        const mapped = mapError(error)
        if (mapped) return mapped
        throw error
      }
    })
  }

  if (event.httpMethod === 'POST') {
    return withPublicDb(async (db) => {
      const body = parseJsonBody<{
        eventId?: string
        personIds?: string[]
        personId?: string
        status?: string
        notes?: string | null
      }>(event.body)
      if (!body?.eventId?.trim()) {
        return fail('VALIDATION_ERROR', 'eventId is required.', 400, {
          eventId: 'Required',
        })
      }

      try {
        if (body.personIds && body.personIds.length > 0) {
          const result = await inviteEventRsvps(
            db,
            body.eventId.trim(),
            body.personIds,
            auth.scope,
            actor,
          )
          return ok(result, 201)
        }
        if (body.personId && body.status) {
          const result = await setEventRsvpStatus(
            db,
            {
              eventId: body.eventId.trim(),
              personId: body.personId,
              status: body.status,
              notes: body.notes,
            },
            auth.scope,
            actor,
          )
          return ok(result)
        }
        return fail(
          'VALIDATION_ERROR',
          'Provide personIds to invite, or personId + status to set a response.',
          400,
        )
      } catch (error) {
        const mapped = mapError(error)
        if (mapped) return mapped
        throw error
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withPublicDb(async (db) => {
      const body = parseJsonBody<{
        eventId?: string
        personId?: string
        status?: string
        notes?: string | null
      }>(event.body)
      if (!body?.eventId?.trim() || !body.personId?.trim() || !body.status) {
        return fail('VALIDATION_ERROR', 'eventId, personId, and status are required.', 400)
      }
      try {
        const result = await setEventRsvpStatus(
          db,
          {
            eventId: body.eventId.trim(),
            personId: body.personId.trim(),
            status: body.status,
            notes: body.notes,
          },
          auth.scope,
          actor,
        )
        return ok(result)
      } catch (error) {
        const mapped = mapError(error)
        if (mapped) return mapped
        throw error
      }
    })
  }

  if (event.httpMethod === 'DELETE') {
    return withPublicDb(async (db) => {
      const eventId = event.queryStringParameters?.eventId?.trim()
      const personId = event.queryStringParameters?.personId?.trim()
      if (!eventId || !personId) {
        return fail('VALIDATION_ERROR', 'eventId and personId are required.', 400)
      }
      try {
        const result = await removeEventRsvp(db, eventId, personId, auth.scope, actor)
        return ok(result)
      } catch (error) {
        const mapped = mapError(error)
        if (mapped) return mapped
        throw error
      }
    })
  }

  return methodNotAllowed(['GET', 'POST', 'PATCH', 'DELETE'])
}
