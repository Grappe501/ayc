import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { requirePersonSession } from '../../server/http/personAuth.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { updatePersonProfile } from '../../server/services/profileService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'PATCH') return methodNotAllowed(['PATCH'])

  const body = parseJsonBody<{
    personId?: string
    hometown?: string | null
    major?: string | null
    interests?: string | null
    narrative?: string | null
  }>(event.body)
  if (!body?.personId?.trim()) {
    return fail('VALIDATION_ERROR', 'Person id is required.', 400, { personId: 'Required' })
  }

  return withPublicDb(async (db) => {
    const personSession = await requirePersonSession(db, event)
    const leader = requireLeaderWriteAccess(event)
    const isOwner = personSession.ok && personSession.session.personId === body.personId!.trim()
    const isLeader = leader.ok

    if (!isOwner && !isLeader) {
      if (personSession.ok === false && personSession.reason === 'misconfigured' && !leader.ok) {
        return fail('UNAUTHORIZED', 'Log in or unlock as a leader to edit profiles.', 401)
      }
      return fail('FORBIDDEN', 'You can only edit your own profile.', 403)
    }

    try {
      const profile = await updatePersonProfile(db, {
        personId: body.personId!.trim(),
        hometown: body.hometown,
        major: body.major,
        interests: body.interests,
        narrative: body.narrative,
        actorType: isOwner ? 'USER' : 'SHARED_LEADER_SESSION',
        actorId: isOwner && personSession.ok ? personSession.session.personId : null,
        actorLabel: isOwner && personSession.ok
          ? personSession.session.displayName
          : leader.ok
            ? leader.scope.label
            : 'Leader',
        requestId: event.headers['x-nf-request-id'] ?? null,
      })
      return ok({ profile })
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
