import { createHash, randomBytes } from 'node:crypto'
import { and, desc, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  accountInvites,
  people,
  personContactMethods,
  userAccounts,
} from '../db/schema.ts'
import { normalizeEmail } from '../domain/normalize.ts'
import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabaseAdmin.ts'
import { insertAuditEvent } from '../repos/audit.ts'

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function generateInviteCode() {
  return randomBytes(5).toString('hex').toUpperCase()
}

async function primaryEmailForPerson(db: AycDatabase, personId: string) {
  const [row] = await db
    .select({
      contactValue: personContactMethods.contactValue,
      normalizedValue: personContactMethods.normalizedValue,
    })
    .from(personContactMethods)
    .where(
      and(
        eq(personContactMethods.personId, personId),
        eq(personContactMethods.contactType, 'EMAIL'),
        eq(personContactMethods.isPrimary, true),
        isNull(personContactMethods.archivedAt),
      ),
    )
    .limit(1)
  return row ?? null
}

export async function getAccountForPerson(db: AycDatabase, personId: string) {
  const [row] = await db
    .select({
      id: userAccounts.id,
      personId: userAccounts.personId,
      email: userAccounts.email,
      accountStatus: userAccounts.accountStatus,
      lastLoginAt: userAccounts.lastLoginAt,
      createdAt: userAccounts.createdAt,
    })
    .from(userAccounts)
    .where(eq(userAccounts.personId, personId))
    .limit(1)
  return row ?? null
}

export async function invitePersonAccount(
  db: AycDatabase,
  input: {
    personId: string
    email?: string | null
    actorLabel: string
    requestId?: string | null
  },
) {
  const [person] = await db
    .select()
    .from(people)
    .where(eq(people.id, input.personId))
    .limit(1)
  if (!person || person.archivedAt) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Person not found.',
    })
  }

  const existing = await getAccountForPerson(db, input.personId)
  if (existing) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      message: 'This person already has a login account.',
      fields: { personId: 'Account already exists' },
    })
  }

  const primary = await primaryEmailForPerson(db, input.personId)
  const emailRaw = (input.email?.trim() || primary?.contactValue || '').trim()
  if (!emailRaw) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      message: 'An email is required to invite this person.',
      fields: { email: 'Required' },
    })
  }
  const email = normalizeEmail(emailRaw)

  const code = generateInviteCode()
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS)

  const [invite] = await db
    .insert(accountInvites)
    .values({
      personId: input.personId,
      email,
      tokenHash: hashInviteToken(code),
      expiresAt,
      invitedByActor: input.actorLabel,
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'ACCOUNT_INVITED',
    entityType: 'ACCOUNT_INVITE',
    entityId: invite!.id,
    actorType: 'SHARED_LEADER_SESSION',
    actorLabel: input.actorLabel,
    changeSummary: `Login invite created for ${person.displayName ?? person.firstName} (${email}).`,
    metadata: { personId: input.personId, email },
    requestId: input.requestId,
  })

  return {
    inviteId: invite!.id,
    personId: input.personId,
    email,
    code,
    expiresAt: expiresAt.toISOString(),
    claimPath: `/claim?email=${encodeURIComponent(email)}`,
  }
}

export async function claimPersonAccount(
  db: AycDatabase,
  input: {
    email: string
    code: string
    password: string
    requestId?: string | null
  },
) {
  if (!isSupabaseConfigured()) {
    throw Object.assign(new Error('MISCONFIGURED'), {
      code: 'MISCONFIGURED' as const,
      message: 'Supabase Auth is not configured on this environment.',
    })
  }

  const email = normalizeEmail(input.email)
  const code = input.code.trim().toUpperCase()
  const password = input.password

  if (!email || !code) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { email: 'Email and invite code are required' },
    })
  }
  if (password.length < 8) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { password: 'Use at least 8 characters' },
    })
  }

  const [invite] = await db
    .select()
    .from(accountInvites)
    .where(
      and(
        eq(accountInvites.email, email),
        eq(accountInvites.tokenHash, hashInviteToken(code)),
        isNull(accountInvites.usedAt),
      ),
    )
    .orderBy(desc(accountInvites.createdAt))
    .limit(1)

  if (!invite) {
    throw Object.assign(new Error('UNAUTHORIZED'), {
      code: 'UNAUTHORIZED' as const,
      message: 'That invite code was not accepted. Check the email and code.',
    })
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error('UNAUTHORIZED'), {
      code: 'UNAUTHORIZED' as const,
      message: 'This invite has expired. Ask a leader for a new invite.',
    })
  }

  const existing = await getAccountForPerson(db, invite.personId)
  if (existing) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      message: 'This person already has a login account.',
    })
  }

  const admin = getSupabaseAdmin()
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { person_id: invite.personId },
  })
  if (error || !created.user) {
    throw Object.assign(new Error('INTERNAL_ERROR'), {
      code: 'INTERNAL_ERROR' as const,
      message: error?.message || 'Could not create the login account.',
    })
  }

  const [account] = await db
    .insert(userAccounts)
    .values({
      personId: invite.personId,
      authSubject: created.user.id,
      email,
      accountStatus: 'ACTIVE',
      lastLoginAt: new Date(),
    })
    .returning()

  await db
    .update(accountInvites)
    .set({ usedAt: new Date() })
    .where(eq(accountInvites.id, invite.id))

  const [person] = await db
    .select()
    .from(people)
    .where(eq(people.id, invite.personId))
    .limit(1)

  await insertAuditEvent(db, {
    eventType: 'ACCOUNT_CLAIMED',
    entityType: 'USER_ACCOUNT',
    entityId: account!.id,
    actorType: 'USER',
    actorId: account!.id,
    actorLabel: person?.displayName ?? email,
    changeSummary: `Account claimed for ${email}.`,
    metadata: { personId: invite.personId },
    requestId: input.requestId,
  })

  const { data: sessionData, error: signInError } = await admin.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError || !sessionData.session) {
    return {
      account: {
        id: account!.id,
        personId: account!.personId,
        email: account!.email,
      },
      session: null as null,
      message: 'Account created. Please log in.',
    }
  }

  return {
    account: {
      id: account!.id,
      personId: account!.personId,
      email: account!.email,
    },
    session: {
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
      expiresAt: sessionData.session.expires_at ?? null,
    },
    message: 'Account created.',
  }
}

export async function touchAccountLogin(db: AycDatabase, accountId: string) {
  await db
    .update(userAccounts)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(userAccounts.id, accountId))
}

export async function getMePayload(db: AycDatabase, personId: string) {
  const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1)
  const account = await getAccountForPerson(db, personId)
  if (!person || !account) return null
  return {
    account: {
      id: account.id,
      email: account.email,
      accountStatus: account.accountStatus,
      lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
    },
    person: {
      id: person.id,
      displayName:
        person.displayName ??
        `${person.preferredName || person.firstName} ${person.lastName}`.trim(),
      firstName: person.firstName,
      lastName: person.lastName,
      preferredName: person.preferredName,
      status: person.status,
    },
  }
}
