import type { Handler } from '@netlify/functions'
import { methodNotAllowed, ok } from '../../server/http/response.ts'
import { getDirectorySummary } from '../../server/services/directoryService.ts'
import { withPublicDb } from './_shared.ts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  return withPublicDb(async (db) => {
    const summary = await getDirectorySummary(db)
    return ok(summary)
  })
}
