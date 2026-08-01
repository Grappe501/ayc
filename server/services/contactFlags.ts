import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { people, personContactMethods } from '../db/schema.ts'
import {
  PREFERRED_CONTACT_METHODS,
  type PreferredContactMethod,
} from '../domain/enums.ts'
import { preferredForTextReady } from '../domain/textReady.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { getContactDetail } from '../repos/peopleDetail.ts'

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

export type ContactFlagsInput = {
  preferredContactMethod?: PreferredContactMethod | null
  /** When true, requires phone; sets preferred to include text + phone consent GRANTED. */
  textReady?: boolean | null
}

export async function updateContactFlags(
  db: AycDatabase,
  personId: string,
  input: ContactFlagsInput,
  actor: ActorContext,
) {
  const detail = await getContactDetail(db, personId)
  if (!detail) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Contact not found.',
    })
  }
  if (detail.status === 'ARCHIVED') {
    throw validationError({ status: 'Restore this contact before editing flags.' })
  }

  if (
    input.preferredContactMethod == null &&
    (input.textReady === undefined || input.textReady === null)
  ) {
    throw validationError({
      preferredContactMethod: 'Set a preferred method or text-ready flag.',
    })
  }

  let nextPreferred =
    input.preferredContactMethod ??
    (detail.preferredContactMethod as PreferredContactMethod | null) ??
    'UNKNOWN'

  if (
    input.preferredContactMethod != null &&
    !(PREFERRED_CONTACT_METHODS as readonly string[]).includes(input.preferredContactMethod)
  ) {
    throw validationError({ preferredContactMethod: 'Choose a valid preferred method.' })
  }

  if (input.textReady === true) {
    if (!detail.phone) {
      throw validationError({
        textReady: 'Add a phone number before marking text-ready.',
      })
    }
    if (
      nextPreferred === 'UNKNOWN' ||
      nextPreferred === 'EMAIL' ||
      input.preferredContactMethod == null
    ) {
      nextPreferred = preferredForTextReady(Boolean(detail.email))
    }
    if (nextPreferred === 'EMAIL') {
      throw validationError({
        preferredContactMethod: 'Text-ready contacts must prefer Text or Either.',
      })
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(people)
      .set({
        preferredContactMethod: nextPreferred,
        updatedAt: new Date(),
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .where(eq(people.id, personId))

    if (input.textReady === true || input.textReady === false) {
      const [phone] = await tx
        .select()
        .from(personContactMethods)
        .where(
          and(
            eq(personContactMethods.personId, personId),
            eq(personContactMethods.contactType, 'MOBILE_PHONE'),
            isNull(personContactMethods.archivedAt),
          ),
        )
        .limit(1)

      if (phone) {
        await tx
          .update(personContactMethods)
          .set({
            consentStatus: input.textReady ? 'GRANTED' : 'UNKNOWN',
            updatedAt: new Date(),
          })
          .where(eq(personContactMethods.id, phone.id))
      }
    }

    await insertAuditEvent(tx, {
      eventType: 'PERSON_UPDATED',
      entityType: 'PERSON',
      entityId: personId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: `Updated contact reach flags for ${detail.displayName ?? detail.firstName}.`,
      metadata: {
        preferredContactMethod: nextPreferred,
        textReady: input.textReady ?? null,
      },
      requestId: actor.requestId,
    })
  })

  return getContactDetail(db, personId)
}
