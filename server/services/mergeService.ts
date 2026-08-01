import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  people,
  personContactMethods,
  personLocationAffiliations,
  personMergeHistory,
  personTeamAssignments,
} from '../db/schema.ts'
import { ARCHIVE_REASON_LABELS } from '../domain/archiveReasons.ts'
import { getContactDetail } from '../repos/peopleDetail.ts'
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

export type MergePeopleInput = {
  survivingPersonId: string
  mergedPersonId: string
  reason?: string | null
}

export type MergePeopleResult = {
  survivingPersonId: string
  mergedPersonId: string
  summary: string
  moved: {
    contactMethods: number
    affiliations: number
    teamAssignments: number
  }
}

/**
 * Merge two people: keep survivor, move unique related rows, archive loser.
 * Volume IV §18 — never silently discard; conflicting primaries stay on survivor.
 */
export async function mergePeople(
  db: AycDatabase,
  input: MergePeopleInput,
  actor: ActorContext,
): Promise<MergePeopleResult> {
  const survivingId = input.survivingPersonId.trim()
  const mergedId = input.mergedPersonId.trim()

  if (!survivingId || !mergedId) {
    throw validationError({
      survivingPersonId: 'Choose both records to merge.',
    })
  }
  if (survivingId === mergedId) {
    throw validationError({
      mergedPersonId: 'Choose two different people to merge.',
    })
  }

  const survivorDetail = await getContactDetail(db, survivingId)
  const mergedDetail = await getContactDetail(db, mergedId)
  if (!survivorDetail) throw notFound('Surviving contact was not found.')
  if (!mergedDetail) throw notFound('Merged contact was not found.')

  const [alreadyMerged] = await db
    .select()
    .from(personMergeHistory)
    .where(eq(personMergeHistory.mergedPersonId, mergedId))
    .limit(1)
  if (alreadyMerged) {
    throw validationError({
      mergedPersonId: 'That contact was already merged into another record.',
    })
  }

  const [survivorWasMerged] = await db
    .select()
    .from(personMergeHistory)
    .where(eq(personMergeHistory.mergedPersonId, survivingId))
    .limit(1)
  if (survivorWasMerged) {
    throw validationError({
      survivingPersonId: 'That contact was already merged away. Pick a different survivor.',
    })
  }

  const moved = { contactMethods: 0, affiliations: 0, teamAssignments: 0 }

  await db.transaction(async (tx) => {
    const survivorMethods = await tx
      .select()
      .from(personContactMethods)
      .where(
        and(
          eq(personContactMethods.personId, survivingId),
          isNull(personContactMethods.archivedAt),
        ),
      )
    const mergedMethods = await tx
      .select()
      .from(personContactMethods)
      .where(
        and(eq(personContactMethods.personId, mergedId), isNull(personContactMethods.archivedAt)),
      )

    const survivorNorms = new Set(survivorMethods.map((m) => `${m.contactType}:${m.normalizedValue}`))

    for (const method of mergedMethods) {
      const key = `${method.contactType}:${method.normalizedValue}`
      if (survivorNorms.has(key)) {
        await tx
          .update(personContactMethods)
          .set({
            archivedAt: new Date(),
            isPrimary: false,
            updatedAt: new Date(),
          })
          .where(eq(personContactMethods.id, method.id))
        continue
      }

      const survivorHasPrimaryOfType = survivorMethods.some(
        (m) => m.contactType === method.contactType && m.isPrimary,
      )

      await tx
        .update(personContactMethods)
        .set({
          personId: survivingId,
          isPrimary: method.isPrimary && !survivorHasPrimaryOfType,
          updatedAt: new Date(),
        })
        .where(eq(personContactMethods.id, method.id))

      survivorNorms.add(key)
      if (method.isPrimary && !survivorHasPrimaryOfType) {
        survivorMethods.push({ ...method, personId: survivingId })
      }
      moved.contactMethods += 1
    }

    const [survivorPrimaryAff] = await tx
      .select()
      .from(personLocationAffiliations)
      .where(
        and(
          eq(personLocationAffiliations.personId, survivingId),
          eq(personLocationAffiliations.isPrimary, true),
          eq(personLocationAffiliations.status, 'ACTIVE'),
        ),
      )
      .limit(1)

    const mergedAffiliations = await tx
      .select()
      .from(personLocationAffiliations)
      .where(
        and(
          eq(personLocationAffiliations.personId, mergedId),
          eq(personLocationAffiliations.status, 'ACTIVE'),
        ),
      )

    for (const affiliation of mergedAffiliations) {
      const keepAsPrimary = affiliation.isPrimary && !survivorPrimaryAff
      await tx
        .update(personLocationAffiliations)
        .set({
          personId: survivingId,
          isPrimary: keepAsPrimary,
          updatedAt: new Date(),
          ...(keepAsPrimary
            ? {}
            : affiliation.isPrimary
              ? { isPrimary: false }
              : {}),
        })
        .where(eq(personLocationAffiliations.id, affiliation.id))
      moved.affiliations += 1
    }

    const survivorAssignments = await tx
      .select()
      .from(personTeamAssignments)
      .where(
        and(
          eq(personTeamAssignments.personId, survivingId),
          eq(personTeamAssignments.status, 'ACTIVE'),
        ),
      )
    const mergedAssignments = await tx
      .select()
      .from(personTeamAssignments)
      .where(
        and(
          eq(personTeamAssignments.personId, mergedId),
          eq(personTeamAssignments.status, 'ACTIVE'),
        ),
      )

    const survivorHasPrimaryTeam = survivorAssignments.some((a) => a.isPrimary)
    const survivorTeamIds = new Set(survivorAssignments.map((a) => a.teamId))

    for (const assignment of mergedAssignments) {
      if (survivorTeamIds.has(assignment.teamId)) {
        const existing = survivorAssignments.find((a) => a.teamId === assignment.teamId)
        if (
          existing &&
          existing.position !== 'LEAD' &&
          assignment.position === 'LEAD'
        ) {
          await tx
            .update(personTeamAssignments)
            .set({
              position: 'LEAD',
              updatedAt: new Date(),
            })
            .where(eq(personTeamAssignments.id, existing.id))
        }
        await tx
          .update(personTeamAssignments)
          .set({
            status: 'ENDED',
            endedAt: new Date(),
            isPrimary: false,
            updatedAt: new Date(),
          })
          .where(eq(personTeamAssignments.id, assignment.id))
        continue
      }

      await tx
        .update(personTeamAssignments)
        .set({
          personId: survivingId,
          isPrimary: assignment.isPrimary && !survivorHasPrimaryTeam,
          updatedAt: new Date(),
        })
        .where(eq(personTeamAssignments.id, assignment.id))
      survivorTeamIds.add(assignment.teamId)
      moved.teamAssignments += 1
    }

    const personPatch: {
      preferredName?: string | null
      middleName?: string | null
      displayName?: string | null
      preferredContactMethod?: string | null
      updatedAt: Date
      updatedByActor: string
      status?: string
      archivedAt?: null
    } = {
      updatedAt: new Date(),
      updatedByActor: actor.actorLabel ?? actor.actorType,
    }

    if (!survivorDetail.preferredName && mergedDetail.preferredName) {
      personPatch.preferredName = mergedDetail.preferredName
    }
    if (!survivorDetail.middleName && mergedDetail.middleName) {
      personPatch.middleName = mergedDetail.middleName
    }
    if (!survivorDetail.displayName && mergedDetail.displayName) {
      personPatch.displayName = mergedDetail.displayName
    }
    if (
      (!survivorDetail.preferredContactMethod ||
        survivorDetail.preferredContactMethod === 'UNKNOWN') &&
      mergedDetail.preferredContactMethod &&
      mergedDetail.preferredContactMethod !== 'UNKNOWN'
    ) {
      personPatch.preferredContactMethod = mergedDetail.preferredContactMethod
    }
    if (survivorDetail.status === 'ARCHIVED') {
      personPatch.status = mergedDetail.status === 'ARCHIVED' ? 'ACTIVE' : mergedDetail.status
      personPatch.archivedAt = null
    }

    await tx.update(people).set(personPatch).where(eq(people.id, survivingId))

    await tx
      .update(people)
      .set({
        status: 'ARCHIVED',
        archivedAt: new Date(),
        updatedAt: new Date(),
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .where(eq(people.id, mergedId))

    const summary = [
      `Merged ${mergedDetail.displayName ?? mergedDetail.firstName} into ${survivorDetail.displayName ?? survivorDetail.firstName}.`,
      `Moved ${moved.contactMethods} contact method(s), ${moved.affiliations} affiliation(s), ${moved.teamAssignments} team assignment(s).`,
    ].join(' ')

    await tx.insert(personMergeHistory).values({
      survivingPersonId: survivingId,
      mergedPersonId: mergedId,
      mergedByActor: actor.actorLabel ?? actor.actorType,
      reason: input.reason?.trim() || 'DUPLICATE_RECORD',
      summary,
    })

    await insertAuditEvent(tx, {
      eventType: 'PERSON_MERGED',
      entityType: 'PERSON',
      entityId: survivingId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: summary,
      metadata: {
        survivingPersonId: survivingId,
        mergedPersonId: mergedId,
        moved,
        reason: input.reason?.trim() || 'DUPLICATE_RECORD',
      },
      requestId: actor.requestId,
    })

    await insertAuditEvent(tx, {
      eventType: 'PERSON_ARCHIVED',
      entityType: 'PERSON',
      entityId: mergedId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: `Archived as duplicate after merge into ${survivingId}.`,
      metadata: {
        reason: 'DUPLICATE_RECORD',
        reasonLabel: ARCHIVE_REASON_LABELS.DUPLICATE_RECORD,
        previousStatus: mergedDetail.status,
        survivingPersonId: survivingId,
      },
      requestId: actor.requestId,
    })
  })

  const summary = [
    `Merged ${mergedDetail.displayName ?? mergedDetail.firstName} into ${survivorDetail.displayName ?? survivorDetail.firstName}.`,
    `Moved ${moved.contactMethods} contact method(s), ${moved.affiliations} affiliation(s), ${moved.teamAssignments} team assignment(s).`,
  ].join(' ')

  return {
    survivingPersonId: survivingId,
    mergedPersonId: mergedId,
    summary,
    moved,
  }
}
