import type { Handler } from '@netlify/functions'
import { methodNotAllowed, ok } from '../../server/http/response.ts'
import { listActiveTeams } from '../../server/repos/teams.ts'
import { withLeaderDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  return withLeaderDb(event, async (db) => {
    const rows = await listActiveTeams(db)
    return ok(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        code: row.code,
        description: row.description,
        displayOrder: row.displayOrder,
      })),
    )
  })
}
