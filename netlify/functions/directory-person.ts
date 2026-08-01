import type { Handler } from '@netlify/functions'
import { requirePersonSession } from '../../server/http/personAuth.ts'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import { getDirectoryPersonDetail } from '../../server/services/directoryService.ts'
import {
  getOrEmptyProfile,
  listProfileNotes,
} from '../../server/services/profileService.ts'
import { getAccountForPerson } from '../../server/services/accountService.ts'
import { canRevealContactsAsync, withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  const id = event.queryStringParameters?.id?.trim()
  if (!id) {
    return fail('VALIDATION_ERROR', 'Person id is required.')
  }

  return withPublicDb(async (db) => {
    const reveal = await canRevealContactsAsync(db, event)
    const person = await getDirectoryPersonDetail(db, id, reveal)
    if (!person) {
      return fail('NOT_FOUND', 'Person not found.', 404)
    }

    const personSession = await requirePersonSession(db, event)
    const isOwner = personSession.ok && personSession.session.personId === id
    const isLeader = reveal
    const includePrivate = isOwner || isLeader

    const [profile, notes, account] = await Promise.all([
      getOrEmptyProfile(db, id),
      listProfileNotes(db, id, { includePrivate }),
      getAccountForPerson(db, id),
    ])

    return ok({
      ...person,
      profile,
      notes,
      hasAccount: Boolean(account),
      viewer: {
        isOwner,
        isLeader,
        canEditProfile: isOwner || isLeader,
        canLeaveNote: personSession.ok,
        personId: personSession.ok ? personSession.session.personId : null,
      },
    })
  })
}
