import { and, desc, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { people, personProfileNotes, personProfiles } from '../db/schema.ts'
import type { ProfileNoteVisibility } from '../domain/enums.ts'
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  PROFILE_PHOTOS_BUCKET,
} from '../lib/supabaseAdmin.ts'
import { insertAuditEvent } from '../repos/audit.ts'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function publicPhotoUrl(photoPath: string | null | undefined) {
  if (!photoPath) return null
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  if (!url) return null
  return `${url.replace(/\/$/, '')}/storage/v1/object/public/${PROFILE_PHOTOS_BUCKET}/${photoPath}`
}

export async function getOrEmptyProfile(db: AycDatabase, personId: string) {
  const [row] = await db
    .select()
    .from(personProfiles)
    .where(eq(personProfiles.personId, personId))
    .limit(1)
  if (row) {
    return {
      hometown: row.hometown,
      major: row.major,
      interests: row.interests,
      narrative: row.narrative,
      photoPath: row.photoPath,
      photoUrl: publicPhotoUrl(row.photoPath),
      updatedAt: row.updatedAt.toISOString(),
    }
  }
  return {
    hometown: null as string | null,
    major: null as string | null,
    interests: null as string | null,
    narrative: null as string | null,
    photoPath: null as string | null,
    photoUrl: null as string | null,
    updatedAt: null as string | null,
  }
}

export async function listProfileNotes(
  db: AycDatabase,
  personId: string,
  opts: { includePrivate: boolean },
) {
  const rows = opts.includePrivate
    ? await db
        .select()
        .from(personProfileNotes)
        .where(
          and(
            eq(personProfileNotes.personId, personId),
            isNull(personProfileNotes.archivedAt),
          ),
        )
        .orderBy(desc(personProfileNotes.createdAt))
        .limit(100)
    : await db
        .select()
        .from(personProfileNotes)
        .where(
          and(
            eq(personProfileNotes.personId, personId),
            isNull(personProfileNotes.archivedAt),
            eq(personProfileNotes.visibility, 'PUBLIC'),
          ),
        )
        .orderBy(desc(personProfileNotes.createdAt))
        .limit(100)

  return rows.map((row) => ({
    id: row.id,
    personId: row.personId,
    authorPersonId: row.authorPersonId,
    authorDisplayName: row.authorDisplayName,
    body: row.body,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function updatePersonProfile(
  db: AycDatabase,
  input: {
    personId: string
    hometown?: string | null
    major?: string | null
    interests?: string | null
    narrative?: string | null
    actorType: 'USER' | 'SHARED_LEADER_SESSION'
    actorId?: string | null
    actorLabel: string
    requestId?: string | null
  },
) {
  const [person] = await db.select().from(people).where(eq(people.id, input.personId)).limit(1)
  if (!person) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Person not found.',
    })
  }

  const hometown =
    input.hometown !== undefined ? input.hometown?.trim() || null : undefined
  const major = input.major !== undefined ? input.major?.trim() || null : undefined
  const interests =
    input.interests !== undefined ? input.interests?.trim() || null : undefined
  const narrative =
    input.narrative !== undefined ? input.narrative?.trim() || null : undefined

  const [existing] = await db
    .select()
    .from(personProfiles)
    .where(eq(personProfiles.personId, input.personId))
    .limit(1)

  if (!existing) {
    await db.insert(personProfiles).values({
      personId: input.personId,
      hometown: hometown ?? null,
      major: major ?? null,
      interests: interests ?? null,
      narrative: narrative ?? null,
    })
  } else {
    await db
      .update(personProfiles)
      .set({
        ...(hometown !== undefined ? { hometown } : {}),
        ...(major !== undefined ? { major } : {}),
        ...(interests !== undefined ? { interests } : {}),
        ...(narrative !== undefined ? { narrative } : {}),
        updatedAt: new Date(),
      })
      .where(eq(personProfiles.personId, input.personId))
  }

  await insertAuditEvent(db, {
    eventType: 'PROFILE_UPDATED',
    entityType: 'PERSON_PROFILE',
    entityId: input.personId,
    actorType: input.actorType,
    actorId: input.actorId,
    actorLabel: input.actorLabel,
    changeSummary: `Directory profile updated for ${person.displayName ?? person.firstName}.`,
    requestId: input.requestId,
  })

  return getOrEmptyProfile(db, input.personId)
}

export async function uploadProfilePhoto(
  db: AycDatabase,
  input: {
    personId: string
    contentType: string
    bytes: Buffer
    actorType: 'USER' | 'SHARED_LEADER_SESSION'
    actorId?: string | null
    actorLabel: string
    requestId?: string | null
  },
) {
  if (!isSupabaseConfigured()) {
    throw Object.assign(new Error('MISCONFIGURED'), {
      code: 'MISCONFIGURED' as const,
      message: 'Photo storage is not configured on this environment.',
    })
  }
  if (!ALLOWED_TYPES.has(input.contentType)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { photo: 'Use JPEG, PNG, or WebP' },
    })
  }
  if (input.bytes.length === 0 || input.bytes.length > MAX_PHOTO_BYTES) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { photo: 'Photo must be under 2MB' },
    })
  }

  const ext =
    input.contentType === 'image/png'
      ? 'png'
      : input.contentType === 'image/webp'
        ? 'webp'
        : 'jpg'
  const path = `${input.personId}/${Date.now()}.${ext}`
  const admin = getSupabaseAdmin()

  const { error: bucketError } = await admin.storage.createBucket(PROFILE_PHOTOS_BUCKET, {
    public: true,
  })
  if (bucketError && !/already exists/i.test(bucketError.message)) {
    // Continue — bucket may exist under a different error shape.
  }

  const { error } = await admin.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .upload(path, input.bytes, { contentType: input.contentType, upsert: true })
  if (error) {
    throw Object.assign(new Error('INTERNAL_ERROR'), {
      code: 'INTERNAL_ERROR' as const,
      message: error.message || 'Could not upload photo.',
    })
  }

  const [existing] = await db
    .select()
    .from(personProfiles)
    .where(eq(personProfiles.personId, input.personId))
    .limit(1)
  if (!existing) {
    await db.insert(personProfiles).values({
      personId: input.personId,
      photoPath: path,
    })
  } else {
    await db
      .update(personProfiles)
      .set({ photoPath: path, updatedAt: new Date() })
      .where(eq(personProfiles.personId, input.personId))
  }

  await insertAuditEvent(db, {
    eventType: 'PROFILE_PHOTO_UPDATED',
    entityType: 'PERSON_PROFILE',
    entityId: input.personId,
    actorType: input.actorType,
    actorId: input.actorId,
    actorLabel: input.actorLabel,
    changeSummary: 'Profile photo updated.',
    requestId: input.requestId,
  })

  return getOrEmptyProfile(db, input.personId)
}

export async function createProfileNote(
  db: AycDatabase,
  input: {
    personId: string
    body: string
    visibility: ProfileNoteVisibility
    authorPersonId: string
    authorDisplayName: string
    requestId?: string | null
  },
) {
  const body = input.body.trim()
  if (body.length < 2) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { body: 'Write a short note' },
    })
  }
  if (body.length > 2000) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { body: 'Keep notes under 2000 characters' },
    })
  }
  if (input.visibility !== 'PUBLIC' && input.visibility !== 'PRIVATE') {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { visibility: 'Invalid visibility' },
    })
  }

  const [person] = await db.select().from(people).where(eq(people.id, input.personId)).limit(1)
  if (!person) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Person not found.',
    })
  }

  const [note] = await db
    .insert(personProfileNotes)
    .values({
      personId: input.personId,
      authorPersonId: input.authorPersonId,
      authorDisplayName: input.authorDisplayName,
      body,
      visibility: input.visibility,
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'PROFILE_NOTE_CREATED',
    entityType: 'PERSON_PROFILE_NOTE',
    entityId: note!.id,
    actorType: 'USER',
    actorId: input.authorPersonId,
    actorLabel: input.authorDisplayName,
    changeSummary: `${input.visibility} note left on ${person.displayName ?? person.firstName}.`,
    requestId: input.requestId,
  })

  return {
    id: note!.id,
    personId: note!.personId,
    authorPersonId: note!.authorPersonId,
    authorDisplayName: note!.authorDisplayName,
    body: note!.body,
    visibility: note!.visibility,
    createdAt: note!.createdAt.toISOString(),
  }
}

export async function archiveProfileNote(
  db: AycDatabase,
  input: {
    noteId: string
    actorPersonId: string | null
    isLeader: boolean
    actorLabel: string
    requestId?: string | null
  },
) {
  const [note] = await db
    .select()
    .from(personProfileNotes)
    .where(
      and(eq(personProfileNotes.id, input.noteId), isNull(personProfileNotes.archivedAt)),
    )
    .limit(1)
  if (!note) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Note not found.',
    })
  }

  const canDelete =
    input.isLeader ||
    input.actorPersonId === note.authorPersonId ||
    input.actorPersonId === note.personId
  if (!canDelete) {
    throw Object.assign(new Error('FORBIDDEN'), {
      code: 'FORBIDDEN' as const,
      message: 'You cannot remove this note.',
    })
  }

  await db
    .update(personProfileNotes)
    .set({ archivedAt: new Date() })
    .where(eq(personProfileNotes.id, note.id))

  await insertAuditEvent(db, {
    eventType: 'PROFILE_NOTE_ARCHIVED',
    entityType: 'PERSON_PROFILE_NOTE',
    entityId: note.id,
    actorType: input.isLeader ? 'SHARED_LEADER_SESSION' : 'USER',
    actorId: input.actorPersonId,
    actorLabel: input.actorLabel,
    changeSummary: 'Profile note archived.',
    requestId: input.requestId,
  })

  return { id: note.id, archived: true }
}
