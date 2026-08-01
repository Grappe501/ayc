import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { requirePersonSession } from '../../server/http/personAuth.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  archiveProfileNote,
  createProfileNote,
} from '../../server/services/profileService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const body = parseJsonBody<{
      personId?: string
      body?: string
      visibility?: 'PUBLIC' | 'PRIVATE'
    }>(event.body)
    if (!body?.personId?.trim() || !body.body) {
      return fail('VALIDATION_ERROR', 'personId and body are required.')
    }

    return withPublicDb(async (db) => {
      const auth = await requirePersonSession(db, event)
      if (!auth.ok) {
        return fail('UNAUTHORIZED', 'Log in to leave a note.', 401)
      }
      try {
        const note = await createProfileNote(db, {
          personId: body.personId!.trim(),
          body: body.body!,
          visibility: body.visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
          authorPersonId: auth.session.personId,
          authorDisplayName: auth.session.displayName,
          requestId: event.headers['x-nf-request-id'] ?? null,
        })
        return ok({ note }, 201)
      } catch (error) {
        const err = error as { code?: string; message?: string; fields?: Record<string, string> }
        if (err.code === 'NOT_FOUND') return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', err.message ?? 'Check the fields.', 400, err.fields)
        }
        throw error
      }
    })
  }

  if (event.httpMethod === 'DELETE') {
    const noteId =
      event.queryStringParameters?.id?.trim() ||
      parseJsonBody<{ id?: string }>(event.body)?.id?.trim()
    if (!noteId) return fail('VALIDATION_ERROR', 'Note id is required.')

    return withPublicDb(async (db) => {
      const personSession = await requirePersonSession(db, event)
      const leader = requireLeaderWriteAccess(event)
      if (!personSession.ok && !leader.ok) {
        return fail('UNAUTHORIZED', 'Log in or unlock as a leader to remove notes.', 401)
      }
      try {
        const result = await archiveProfileNote(db, {
          noteId,
          actorPersonId: personSession.ok ? personSession.session.personId : null,
          isLeader: leader.ok,
          actorLabel: personSession.ok
            ? personSession.session.displayName
            : leader.ok
              ? leader.scope.label
              : 'Leader',
          requestId: event.headers['x-nf-request-id'] ?? null,
        })
        return ok(result)
      } catch (error) {
        const err = error as { code?: string; message?: string }
        if (err.code === 'NOT_FOUND') return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
        if (err.code === 'FORBIDDEN') return fail('FORBIDDEN', err.message ?? 'Forbidden.', 403)
        throw error
      }
    })
  }

  return methodNotAllowed(['POST', 'DELETE'])
}
