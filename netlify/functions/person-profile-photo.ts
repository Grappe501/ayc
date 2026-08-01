import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { requirePersonSession } from '../../server/http/personAuth.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { uploadProfilePhoto } from '../../server/services/profileService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed(['POST'])

  const body = parseJsonBody<{
    personId?: string
    contentType?: string
    dataBase64?: string
  }>(event.body)
  if (!body?.personId?.trim() || !body.dataBase64 || !body.contentType) {
    return fail('VALIDATION_ERROR', 'personId, contentType, and dataBase64 are required.')
  }

  let bytes: Buffer
  try {
    bytes = Buffer.from(body.dataBase64, 'base64')
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid image data.', 400, { photo: 'Invalid data' })
  }

  return withPublicDb(async (db) => {
    const personSession = await requirePersonSession(db, event)
    const leader = requireLeaderWriteAccess(event)
    const personId = body.personId!.trim()
    const isOwner = personSession.ok && personSession.session.personId === personId
    const isLeader = leader.ok

    if (!isOwner && !isLeader) {
      return fail('FORBIDDEN', 'You can only update your own photo.', 403)
    }

    try {
      const profile = await uploadProfilePhoto(db, {
        personId,
        contentType: body.contentType!,
        bytes,
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
      if (err.code === 'MISCONFIGURED') {
        return fail('MISCONFIGURED', err.message ?? 'Storage not configured.', 503)
      }
      if (err.code === 'VALIDATION_ERROR') {
        return fail('VALIDATION_ERROR', err.message ?? 'Check the fields.', 400, err.fields)
      }
      if (err.code === 'INTERNAL_ERROR') {
        return fail('INTERNAL_ERROR', err.message ?? 'Upload failed.', 500)
      }
      throw error
    }
  })
}
