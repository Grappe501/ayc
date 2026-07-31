import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import { getDirectoryPersonDetail } from '../../server/services/directoryService.ts'
import { canRevealContacts, withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  const id = event.queryStringParameters?.id?.trim()
  if (!id) {
    return fail('VALIDATION_ERROR', 'Person id is required.')
  }

  const reveal = canRevealContacts(event)

  return withPublicDb(async (db) => {
    const person = await getDirectoryPersonDetail(db, id, reveal)
    if (!person) {
      return fail('NOT_FOUND', 'Person not found.', 404)
    }
    return ok(person)
  })
}
