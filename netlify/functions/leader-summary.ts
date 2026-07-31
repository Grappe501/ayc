import type { Handler } from '@netlify/functions'
import { methodNotAllowed, ok } from '../../server/http/response.ts'
import { getLeaderBoardStats } from '../../server/services/leaderStats.ts'
import { withLeaderDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  return withLeaderDb(event, async (db) => {
    const stats = await getLeaderBoardStats(db)
    return ok(stats)
  })
}
