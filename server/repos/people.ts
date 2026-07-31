import { and, eq, ilike, isNull, or } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  people,
  personContactMethods,
  personLocationAffiliations,
  personTeamAssignments,
} from '../db/schema.ts'
import type { ValidatedContactCreate } from '../domain/validateContact.ts'
import { insertAuditEvent } from './audit.ts'

export type ActorContext = {
  actorType: 'SYSTEM' | 'SHARED_LEADER_SESSION' | 'USER' | 'ADMIN' | 'IMPORT'
  actorId?: string | null
  actorLabel?: string | null
  requestId?: string | null
}

/**
 * Transactional contact create — Volume IV §16 sequence without HTTP layer (Phase 1D).
 */
export async function createContactRecord(
  db: AycDatabase,
  input: ValidatedContactCreate & { locationId: string },
  actor: ActorContext,
) {
  return db.transaction(async (tx) => {
    const [person] = await tx
      .insert(people)
      .values({
        firstName: input.person.firstName,
        middleName: input.person.middleName,
        lastName: input.person.lastName,
        preferredName: input.person.preferredName,
        displayName: input.person.displayName,
        status: input.person.status,
        source: input.person.source,
        preferredContactMethod: input.person.preferredContactMethod,
        createdByActor: actor.actorLabel ?? actor.actorType,
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .returning()

    if (input.email) {
      await tx.insert(personContactMethods).values({
        personId: person.id,
        contactType: 'EMAIL',
        contactValue: input.email.value,
        normalizedValue: input.email.normalized,
        isPrimary: true,
        isVerified: false,
        consentStatus: 'UNKNOWN',
      })
    }

    if (input.phone) {
      await tx.insert(personContactMethods).values({
        personId: person.id,
        contactType: 'MOBILE_PHONE',
        contactValue: input.phone.value,
        normalizedValue: input.phone.normalized,
        isPrimary: true,
        isVerified: false,
        consentStatus: 'UNKNOWN',
      })
    }

    await tx.insert(personLocationAffiliations).values({
      personId: person.id,
      locationId: input.locationId,
      affiliationType: input.affiliationType,
      isPrimary: true,
      status: 'ACTIVE',
    })

    await tx.insert(personTeamAssignments).values({
      personId: person.id,
      teamId: input.primaryTeamId,
      position: input.position,
      isPrimary: true,
      status: input.assignmentStatus,
      assignedByActor: actor.actorLabel ?? actor.actorType,
    })

    for (const teamId of input.additionalTeamIds) {
      await tx.insert(personTeamAssignments).values({
        personId: person.id,
        teamId,
        position: input.position,
        isPrimary: false,
        status: 'ACTIVE',
        assignedByActor: actor.actorLabel ?? actor.actorType,
      })
    }

    await insertAuditEvent(tx, {
      eventType: 'PERSON_CREATED',
      entityType: 'PERSON',
      entityId: person.id,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: `Created contact ${person.displayName ?? person.firstName}.`,
      metadata: {
        primaryTeamId: input.primaryTeamId,
        locationId: input.locationId,
        source: input.person.source,
      },
      requestId: actor.requestId,
    })

    return person
  })
}

export async function findPeopleByNormalizedContact(
  db: AycDatabase,
  opts: { email?: string | null; phone?: string | null },
) {
  const clauses = []
  if (opts.email) {
    clauses.push(
      and(
        eq(personContactMethods.contactType, 'EMAIL'),
        eq(personContactMethods.normalizedValue, opts.email),
        isNull(personContactMethods.archivedAt),
      ),
    )
  }
  if (opts.phone) {
    clauses.push(
      and(
        eq(personContactMethods.contactType, 'MOBILE_PHONE'),
        eq(personContactMethods.normalizedValue, opts.phone),
        isNull(personContactMethods.archivedAt),
      ),
    )
  }
  if (clauses.length === 0) return []

  const where = clauses.length === 1 ? clauses[0]! : or(...clauses)

  return db
    .select({
      personId: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      status: people.status,
      contactType: personContactMethods.contactType,
      normalizedValue: personContactMethods.normalizedValue,
    })
    .from(personContactMethods)
    .innerJoin(people, eq(people.id, personContactMethods.personId))
    .where(where)
}

export async function findPeopleByName(db: AycDatabase, firstName: string, lastName: string) {
  return db
    .select()
    .from(people)
    .where(
      and(ilike(people.firstName, firstName.trim()), ilike(people.lastName, lastName.trim())),
    )
    .limit(25)
}
