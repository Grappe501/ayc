import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { people, personPipelineTags } from '../db/schema.ts'
import { PIPELINE_TAG_LABELS, type PipelineTag } from '../domain/enums.ts'
import { isPipelineTag } from '../domain/pipelineTags.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

function notFound(message: string): Error {
  return Object.assign(new Error('NOT_FOUND'), {
    code: 'NOT_FOUND' as const,
    message,
  })
}

export async function listPipelineTagsForPerson(
  db: AycDatabase,
  personId: string,
): Promise<PipelineTag[]> {
  const rows = await db
    .select({ tag: personPipelineTags.tag })
    .from(personPipelineTags)
    .where(
      and(eq(personPipelineTags.personId, personId), isNull(personPipelineTags.archivedAt)),
    )
  return rows.map((row) => row.tag as PipelineTag)
}

export async function listPipelineTagsForPeople(
  db: AycDatabase,
  personIds: string[],
): Promise<Map<string, PipelineTag[]>> {
  const map = new Map<string, PipelineTag[]>()
  if (personIds.length === 0) return map

  const rows = await db
    .select({
      personId: personPipelineTags.personId,
      tag: personPipelineTags.tag,
    })
    .from(personPipelineTags)
    .where(
      and(
        inArray(personPipelineTags.personId, personIds),
        isNull(personPipelineTags.archivedAt),
      ),
    )

  for (const row of rows) {
    const current = map.get(row.personId) ?? []
    current.push(row.tag as PipelineTag)
    map.set(row.personId, current)
  }
  return map
}

/** Merge tags onto a person without removing existing ones. */
export async function addPipelineTags(
  db: AycDatabase,
  personId: string,
  tags: string[],
  actor: ActorContext,
): Promise<PipelineTag[]> {
  const current = await listPipelineTagsForPerson(db, personId)
  return setPipelineTags(db, personId, [...current, ...tags], actor)
}

/**
 * Replace active pipeline tags for a person with the provided set.
 * Adds missing tags; archives removed tags.
 */
export async function setPipelineTags(
  db: AycDatabase,
  personId: string,
  tags: string[],
  actor: ActorContext,
): Promise<PipelineTag[]> {
  const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1)
  if (!person) throw notFound('Contact not found.')
  if (person.status === 'ARCHIVED') {
    throw validationError({ status: 'Restore this contact before editing pipeline tags.' })
  }

  const next = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
  for (const tag of next) {
    if (!isPipelineTag(tag)) {
      throw validationError({ tags: `Unknown pipeline tag: ${tag}` })
    }
  }

  const current = await db
    .select()
    .from(personPipelineTags)
    .where(
      and(eq(personPipelineTags.personId, personId), isNull(personPipelineTags.archivedAt)),
    )

  const currentSet = new Set(current.map((row) => row.tag))
  const nextSet = new Set(next)

  for (const row of current) {
    if (!nextSet.has(row.tag)) {
      await db
        .update(personPipelineTags)
        .set({
          archivedAt: new Date(),
          updatedAt: new Date(),
          updatedByActor: actor.actorLabel ?? actor.actorType,
        })
        .where(eq(personPipelineTags.id, row.id))

      await insertAuditEvent(db, {
        eventType: 'PIPELINE_TAG_REMOVED',
        entityType: 'PIPELINE_TAG',
        entityId: row.id,
        actorType: actor.actorType,
        actorId: actor.actorId,
        actorLabel: actor.actorLabel,
        changeSummary: `Removed pipeline tag ${PIPELINE_TAG_LABELS[row.tag as PipelineTag]} from ${person.displayName ?? person.firstName}.`,
        metadata: { personId, tag: row.tag },
        requestId: actor.requestId,
      })
    }
  }

  for (const tag of next) {
    if (currentSet.has(tag)) continue
    const [created] = await db
      .insert(personPipelineTags)
      .values({
        personId,
        tag,
        createdByActor: actor.actorLabel ?? actor.actorType,
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .returning()

    await insertAuditEvent(db, {
      eventType: 'PIPELINE_TAG_ADDED',
      entityType: 'PIPELINE_TAG',
      entityId: created.id,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: `Added pipeline tag ${PIPELINE_TAG_LABELS[tag as PipelineTag]} to ${person.displayName ?? person.firstName}.`,
      metadata: { personId, tag },
      requestId: actor.requestId,
    })
  }

  return listPipelineTagsForPerson(db, personId)
}
