import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import { listTeamAttentionDigests } from '../../server/services/teamDigestService.ts'
import { withLeaderDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  return withLeaderDb(event, async (db) => {
    try {
      const result = await listTeamAttentionDigests(db)
      return ok(result)
    } catch (error) {
      console.error(error)
      return fail('INTERNAL_ERROR', 'Could not load team digests.', 500)
    }
  })
}
