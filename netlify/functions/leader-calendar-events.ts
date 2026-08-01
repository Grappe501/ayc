import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  cancelCalendarOccurrence,
  createCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from '../../server/services/calendarService.ts'
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

export const handler: Handler = async (event) => {
  const auth = requireLeaderWriteAccess(event)
  if (!auth.ok) {
    return auth.reason === 'misconfigured' ? misconfigured() : unauthorized()
  }

  if (event.httpMethod === 'GET') {
    return withPublicDb(async (db) => {
      const params = event.queryStringParameters ?? {}
      try {
        const result = await listCalendarEvents(
          db,
          {
            boardSlug: params.board ?? params.boardSlug ?? null,
            locationId: params.locationId ?? null,
            teamSlug: params.teamSlug ?? null,
            mode: params.mode === 'own' ? 'own' : 'rollup',
            from: params.from ?? null,
            to: params.to ?? null,
            includeCancelled: params.includeCancelled === '1',
          },
          auth.scope,
        )
        return ok(result)
      } catch (error) {
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
        throw error
      }
    })
  }

  if (event.httpMethod === 'POST') {
    return withPublicDb(async (db) => {
      const body = parseJsonBody<{
        boardSlug?: string
        locationId?: string
        teamSlug?: string
        title?: string
        description?: string | null
        startsAt?: string
        endsAt?: string
        allDay?: boolean
        locationText?: string | null
        url?: string | null
        recurrenceFrequency?: string | null
        recurrenceInterval?: number | null
        recurrenceByWeekday?: number[] | null
        recurrenceUntil?: string | null
        recurrenceCount?: number | null
      }>(event.body)
      if (!body) return fail('VALIDATION_ERROR', 'Request body must be JSON.')

      const actor = {
        actorType: 'SHARED_LEADER_SESSION' as const,
        actorLabel: auth.scope.label,
        requestId: event.headers['x-nf-request-id'] ?? null,
      }

      try {
        const result = await createCalendarEvent(db, body, auth.scope, actor)
        const listed = await listCalendarEvents(
          db,
          {
            boardSlug: body.boardSlug,
            locationId: body.locationId,
            teamSlug: body.teamSlug,
            mode: 'own',
          },
          auth.scope,
        )
        const created = listed.events.find((item) => item.id === result.eventId)
        return ok({ board: result.board, event: created }, 201)
      } catch (error) {
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
        throw error
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withPublicDb(async (db) => {
      const body = parseJsonBody<{
        id?: string
        title?: string
        description?: string | null
        startsAt?: string
        endsAt?: string
        allDay?: boolean
        locationText?: string | null
        url?: string | null
        status?: 'SCHEDULED' | 'CANCELLED'
        cancelScope?: 'one' | 'series'
        occurrenceStartsAt?: string | null
        recurrenceFrequency?: string | null
        recurrenceInterval?: number | null
        recurrenceByWeekday?: number[] | null
        recurrenceUntil?: string | null
        recurrenceCount?: number | null
      }>(event.body)
      if (!body?.id?.trim()) {
        return fail('VALIDATION_ERROR', 'Event id is required.', 400, { id: 'Required' })
      }

      const actor = {
        actorType: 'SHARED_LEADER_SESSION' as const,
        actorLabel: auth.scope.label,
        requestId: event.headers['x-nf-request-id'] ?? null,
      }

      try {
        if (body.cancelScope === 'one' || body.cancelScope === 'series') {
          const result = await cancelCalendarOccurrence(
            db,
            {
              eventId: body.id.trim(),
              scope: body.cancelScope,
              occurrenceStartsAt: body.occurrenceStartsAt,
            },
            auth.scope,
            actor,
          )
          return ok(result)
        }
        await updateCalendarEvent(db, body.id.trim(), body, auth.scope, actor)
        return ok({ id: body.id.trim(), status: body.status ?? 'updated' })
      } catch (error) {
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
        throw error
      }
    })
  }

  return methodNotAllowed(['GET', 'POST', 'PATCH'])
}
