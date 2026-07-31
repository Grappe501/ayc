import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { closeDb, getDatabaseUrl, getDb } from '../../server/db/client.ts'
import {
  requireLeaderWriteAccess,
  extractLeaderSecret,
  getLeaderWriteSecret,
  secretsMatch,
} from '../../server/http/auth.ts'
import { fail } from '../../server/http/response.ts'

export function canRevealContacts(event: HandlerEvent): boolean {
  const expected = getLeaderWriteSecret()
  const provided = extractLeaderSecret(event)
  if (!expected || !provided) return false
  return secretsMatch(provided, expected)
}

export async function withPublicDb(
  run: (db: ReturnType<typeof getDb>) => Promise<HandlerResponse>,
): Promise<HandlerResponse> {
  if (!getDatabaseUrl()) {
    return fail('DATABASE_ERROR', 'The directory database is not available right now.', 503)
  }

  try {
    return await run(getDb())
  } catch (error) {
    console.error(error)
    return fail('INTERNAL_ERROR', 'Something went wrong. Please try again.', 500)
  } finally {
    await closeDb()
  }
}

export async function withLeaderDb(
  event: HandlerEvent,
  run: (db: ReturnType<typeof getDb>) => Promise<HandlerResponse>,
): Promise<HandlerResponse> {
  const auth = requireLeaderWriteAccess(event)
  if (!auth.ok) {
    if (auth.reason === 'misconfigured') {
      return fail(
        'MISCONFIGURED',
        'Leader write access is not configured on this environment.',
        503,
      )
    }
    return fail(
      'UNAUTHORIZED',
      'That access code was not accepted. Please check it and try again.',
      401,
    )
  }

  return withPublicDb(run)
}
