import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { closeDb, getDatabaseUrl, getDb } from '../../server/db/client.ts'
import { extractLeaderSecret, resolveKey } from '../../server/http/auth.ts'
import {
  accountCanRevealContacts,
  requireBoardWriteAccess,
  roleRowsToGrants,
} from '../../server/http/boardAccess.ts'
import { resolvePersonSession } from '../../server/http/personAuth.ts'
import { fail } from '../../server/http/response.ts'
import { listLeadershipRolesForPerson } from '../../server/services/leadershipRoleService.ts'

/** Sync key check — prefer async canRevealContactsAsync when DB is open. */
export function canRevealContacts(event: HandlerEvent): boolean {
  const provided = extractLeaderSecret(event)
  if (!provided) return false
  return Boolean(resolveKey(provided))
}

export async function canRevealContactsAsync(
  db: ReturnType<typeof getDb>,
  event: HandlerEvent,
): Promise<boolean> {
  if (canRevealContacts(event)) return true
  const person = await resolvePersonSession(db, event)
  if (!person.ok) return false
  const rows = await listLeadershipRolesForPerson(db, person.session.personId)
  return accountCanRevealContacts(roleRowsToGrants(rows))
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
  return withPublicDb(async (db) => {
    const auth = await requireBoardWriteAccess(db, event)
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
        'Log in with a leadership account, or use the emergency board key.',
        401,
      )
    }
    return run(db)
  })
}
