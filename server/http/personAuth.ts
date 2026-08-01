import type { HandlerEvent } from '@netlify/functions'
import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { people, userAccounts } from '../db/schema.ts'
import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabaseAdmin.ts'

export type PersonSession = {
  accountId: string
  personId: string
  authSubject: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
}

export function extractBearerToken(event: HandlerEvent): string | null {
  const header =
    event.headers.authorization ??
    event.headers.Authorization ??
    event.headers['authorization']
  if (!header) return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match?.[1]?.trim() || null
}

export async function resolvePersonSession(
  db: AycDatabase,
  event: HandlerEvent,
): Promise<
  | { ok: true; session: PersonSession }
  | { ok: false; reason: 'missing' | 'invalid' | 'disabled' | 'misconfigured' }
> {
  const token = extractBearerToken(event)
  if (!token) return { ok: false, reason: 'missing' }
  if (!isSupabaseConfigured()) return { ok: false, reason: 'misconfigured' }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return { ok: false, reason: 'invalid' }

  const [row] = await db
    .select({
      accountId: userAccounts.id,
      personId: userAccounts.personId,
      authSubject: userAccounts.authSubject,
      email: userAccounts.email,
      accountStatus: userAccounts.accountStatus,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      displayName: people.displayName,
      archivedAt: people.archivedAt,
    })
    .from(userAccounts)
    .innerJoin(people, eq(people.id, userAccounts.personId))
    .where(
      and(eq(userAccounts.authSubject, data.user.id), isNull(people.archivedAt)),
    )
    .limit(1)

  if (!row) return { ok: false, reason: 'invalid' }
  if (row.accountStatus !== 'ACTIVE') return { ok: false, reason: 'disabled' }

  return {
    ok: true,
    session: {
      accountId: row.accountId,
      personId: row.personId,
      authSubject: row.authSubject,
      email: row.email,
      displayName:
        row.displayName ??
        `${row.preferredName || row.firstName} ${row.lastName}`.trim(),
      firstName: row.firstName,
      lastName: row.lastName,
      preferredName: row.preferredName,
    },
  }
}

export async function requirePersonSession(
  db: AycDatabase,
  event: HandlerEvent,
) {
  return resolvePersonSession(db, event)
}
