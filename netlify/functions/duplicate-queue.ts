import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import { listDuplicateQueue } from '../../server/services/duplicateQueue.ts'
import { withLeaderDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  return withLeaderDb(event, async (db) => {
    try {
      const queue = await listDuplicateQueue(db)
      return ok(queue)
    } catch (error) {
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not load the duplicate queue.', 500)
    }
  })
}
