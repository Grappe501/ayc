import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  assessDuplicates,
  shouldBlockCreation,
  type DuplicateCandidate,
} from '../domain/duplicates.ts'
import { normalizeEmail, normalizePhone } from '../domain/normalize.ts'
import {
  validateContactCreate,
  type ContactCreateInput,
  type ValidatedContactCreate,
} from '../domain/validateContact.ts'
import {
  people,
  personContactMethods,
  personLocationAffiliations,
  personTeamAssignments,
} from '../db/schema.ts'
import { createLocation, findLocationByTypeAndCode } from '../repos/locations.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import {
  findPeopleByName,
  findPeopleByNormalizedContact,
  type ActorContext,
} from '../repos/people.ts'
import { getContactDetail } from '../repos/peopleDetail.ts'
import { getTeamById } from '../repos/teams.ts'
import type { ContactCreateResult } from './contactService.ts'

export type ContactUpdateRequest = ContactCreateInput & {
  confirmDuplicate?: boolean
  forceCreateDespiteExact?: boolean
}

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

async function loadDuplicateCandidatesExcluding(
  db: AycDatabase,
  validated: ValidatedContactCreate,
  excludePersonId: string,
): Promise<DuplicateCandidate[]> {
  const byContact = await findPeopleByNormalizedContact(db, {
    email: validated.email?.normalized,
    phone: validated.phone?.normalized,
  })
  const byName = await findPeopleByName(
    db,
    validated.person.firstName,
    validated.person.lastName,
  )

  const ids = new Set<string>([
    ...byContact.map((row) => row.personId),
    ...byName.map((row) => row.id),
  ])
  ids.delete(excludePersonId)

  const candidates: DuplicateCandidate[] = []
  for (const id of ids) {
    const [person] = await db.select().from(people).where(eq(people.id, id)).limit(1)
    if (!person) continue

    const methods = await db
      .select()
      .from(personContactMethods)
      .where(
        and(eq(personContactMethods.personId, id), isNull(personContactMethods.archivedAt)),
      )

    const affiliation = await db
      .select()
      .from(personLocationAffiliations)
      .where(
        and(
          eq(personLocationAffiliations.personId, id),
          eq(personLocationAffiliations.isPrimary, true),
          eq(personLocationAffiliations.status, 'ACTIVE'),
        ),
      )
      .limit(1)

    const assignments = await db
      .select()
      .from(personTeamAssignments)
      .where(
        and(
          eq(personTeamAssignments.personId, id),
          eq(personTeamAssignments.status, 'ACTIVE'),
        ),
      )

    candidates.push({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      preferredName: person.preferredName,
      status: person.status,
      emails: methods.filter((m) => m.contactType === 'EMAIL').map((m) => m.normalizedValue),
      phones: methods
        .filter((m) => m.contactType === 'MOBILE_PHONE')
        .map((m) => m.normalizedValue),
      primaryLocationId: affiliation[0]?.locationId ?? null,
      teamIds: assignments.map((a) => a.teamId),
    })
  }

  return candidates
}

function maskEmail(email: string): string {
  const normalized = normalizeEmail(email)
  const [local, domain] = normalized.split('@')
  if (!domain) return '***'
  return `${local.slice(0, 1)}***@${domain}`
}

function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length < 4) return '***'
  return `***-***-${normalized.slice(-4)}`
}

async function resolveLocationId(
  db: AycDatabase,
  value: ValidatedContactCreate,
  actor: ActorContext,
): Promise<string> {
  if (value.location.id) return value.location.id

  const existing = await findLocationByTypeAndCode(
    db,
    value.location.locationType,
    value.location.code,
  )
  if (existing) return existing.id

  const created = await createLocation(db, {
    locationType: value.location.locationType,
    name: value.location.name,
    code: value.location.code,
    shortName: value.location.shortName,
    city: value.location.city,
    countyName: value.location.countyName,
    state: value.location.state,
    actor: actor.actorLabel ?? actor.actorType,
  })
  return created.id
}

type Tx = {
  select: AycDatabase['select']
  insert: AycDatabase['insert']
  update: AycDatabase['update']
}

async function syncPrimaryContactMethod(
  tx: Tx,
  personId: string,
  contactType: 'EMAIL' | 'MOBILE_PHONE',
  next: { value: string; normalized: string } | null,
  actor: ActorContext,
) {
  const current = await tx
    .select()
    .from(personContactMethods)
    .where(
      and(
        eq(personContactMethods.personId, personId),
        eq(personContactMethods.contactType, contactType),
        eq(personContactMethods.isPrimary, true),
        isNull(personContactMethods.archivedAt),
      ),
    )
    .limit(1)

  const existing = current[0]
  if (!next) {
    if (existing) {
      await tx
        .update(personContactMethods)
        .set({ archivedAt: new Date(), updatedAt: new Date(), isPrimary: false })
        .where(eq(personContactMethods.id, existing.id))
      await insertAuditEvent(tx, {
        eventType: 'CONTACT_METHOD_UPDATED',
        entityType: 'CONTACT_METHOD',
        entityId: existing.id,
        actorType: actor.actorType,
        actorLabel: actor.actorLabel,
        changeSummary: `Removed primary ${contactType === 'EMAIL' ? 'email' : 'phone'}.`,
        requestId: actor.requestId,
      })
    }
    return
  }

  if (existing && existing.normalizedValue === next.normalized) {
    if (existing.contactValue !== next.value) {
      await tx
        .update(personContactMethods)
        .set({ contactValue: next.value, updatedAt: new Date() })
        .where(eq(personContactMethods.id, existing.id))
    }
    return
  }

  if (existing) {
    await tx
      .update(personContactMethods)
      .set({ archivedAt: new Date(), updatedAt: new Date(), isPrimary: false })
      .where(eq(personContactMethods.id, existing.id))
  }

  const [created] = await tx
    .insert(personContactMethods)
    .values({
      personId,
      contactType,
      contactValue: next.value,
      normalizedValue: next.normalized,
      isPrimary: true,
      isVerified: false,
      consentStatus: 'UNKNOWN',
    })
    .returning()

  await insertAuditEvent(tx, {
    eventType: existing ? 'CONTACT_METHOD_UPDATED' : 'CONTACT_METHOD_ADDED',
    entityType: 'CONTACT_METHOD',
    entityId: created.id,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary: existing
      ? `Updated primary ${contactType === 'EMAIL' ? 'email' : 'phone'}.`
      : `Added primary ${contactType === 'EMAIL' ? 'email' : 'phone'}.`,
    requestId: actor.requestId,
  })
}

export async function updateContact(
  db: AycDatabase,
  personId: string,
  input: ContactUpdateRequest,
  actor: ActorContext,
): Promise<ContactCreateResult> {
  const existingDetail = await getContactDetail(db, personId)
  if (!existingDetail) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Contact not found.',
    })
  }
  if (existingDetail.status === 'ARCHIVED') {
    throw validationError({
      status: 'Restore this contact before editing.',
    })
  }

  const validated = validateContactCreate(input)
  if (!validated.ok) {
    throw validationError(
      Object.fromEntries(validated.issues.map((i) => [i.field, i.message])),
    )
  }
  const value = validated.value

  const primaryTeam = await getTeamById(db, value.primaryTeamId)
  if (!primaryTeam?.active) {
    throw validationError({ primaryTeamId: 'Primary team was not found.' })
  }
  for (const teamId of value.additionalTeamIds) {
    const team = await getTeamById(db, teamId)
    if (!team?.active) {
      throw validationError({
        additionalTeamIds: 'One or more additional teams were not found.',
      })
    }
  }

  const contactChanged =
    (value.email?.normalized ?? null) !== (existingDetail.email?.normalized ?? null) ||
    (value.phone?.normalized ?? null) !== (existingDetail.phone?.normalized ?? null)

  if (contactChanged || value.person.firstName !== existingDetail.firstName || value.person.lastName !== existingDetail.lastName) {
    const candidates = await loadDuplicateCandidatesExcluding(db, value, personId)
    const assessment = assessDuplicates(
      {
        firstName: value.person.firstName,
        lastName: value.person.lastName,
        preferredName: value.person.preferredName,
        email: value.email?.normalized,
        phone: value.phone?.normalized,
        primaryLocationId: value.location.id,
        teamIds: [value.primaryTeamId, ...value.additionalTeamIds],
      },
      candidates,
    )

    if (assessment.result !== 'NO_MATCH') {
      const blockExact =
        shouldBlockCreation(assessment.result) && !input.forceCreateDespiteExact
      const needsConfirm =
        (assessment.result === 'POSSIBLE_MATCH' || assessment.result === 'LIKELY_MATCH') &&
        !input.confirmDuplicate

      if (
        blockExact ||
        needsConfirm ||
        (assessment.result === 'EXACT_MATCH' && !input.forceCreateDespiteExact)
      ) {
        return {
          status: 'duplicate_review',
          result: assessment.result,
          reasons: assessment.reasons,
          candidates: candidates
            .filter((c) => assessment.matchedCandidateIds.includes(c.id))
            .map((c) => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              preferredName: c.preferredName ?? null,
              status: c.status,
              emails: c.emails.map(maskEmail),
              phones: c.phones.map(maskPhone),
            })),
        }
      }
    }
  }

  const locationId = await resolveLocationId(db, value, actor)
  const previousStatus = existingDetail.status

  await db.transaction(async (tx) => {
    await tx
      .update(people)
      .set({
        firstName: value.person.firstName,
        middleName: value.person.middleName,
        lastName: value.person.lastName,
        preferredName: value.person.preferredName,
        displayName: value.person.displayName,
        status: value.person.status,
        preferredContactMethod: value.person.preferredContactMethod,
        updatedAt: new Date(),
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .where(eq(people.id, personId))

    await syncPrimaryContactMethod(tx, personId, 'EMAIL', value.email, actor)
    await syncPrimaryContactMethod(tx, personId, 'MOBILE_PHONE', value.phone, actor)

    const [currentAffiliation] = await tx
      .select()
      .from(personLocationAffiliations)
      .where(
        and(
          eq(personLocationAffiliations.personId, personId),
          eq(personLocationAffiliations.isPrimary, true),
          eq(personLocationAffiliations.status, 'ACTIVE'),
        ),
      )
      .limit(1)

    if (!currentAffiliation || currentAffiliation.locationId !== locationId) {
      if (currentAffiliation) {
        await tx
          .update(personLocationAffiliations)
          .set({
            status: 'ENDED',
            isPrimary: false,
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(personLocationAffiliations.id, currentAffiliation.id))
      }
      await tx.insert(personLocationAffiliations).values({
        personId,
        locationId,
        affiliationType: value.affiliationType,
        isPrimary: true,
        status: 'ACTIVE',
      })
    } else if (currentAffiliation.affiliationType !== value.affiliationType) {
      await tx
        .update(personLocationAffiliations)
        .set({
          affiliationType: value.affiliationType,
          updatedAt: new Date(),
        })
        .where(eq(personLocationAffiliations.id, currentAffiliation.id))
    }

    const activeAssignments = await tx
      .select()
      .from(personTeamAssignments)
      .where(
        and(
          eq(personTeamAssignments.personId, personId),
          eq(personTeamAssignments.status, 'ACTIVE'),
        ),
      )

    const desiredTeamIds = new Set([value.primaryTeamId, ...value.additionalTeamIds])

    for (const assignment of activeAssignments) {
      const stillDesired = desiredTeamIds.has(assignment.teamId)
      const shouldBePrimary = assignment.teamId === value.primaryTeamId
      if (!stillDesired) {
        await tx
          .update(personTeamAssignments)
          .set({
            status: 'ENDED',
            isPrimary: false,
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(personTeamAssignments.id, assignment.id))
        await insertAuditEvent(tx, {
          eventType: 'TEAM_ASSIGNMENT_ENDED',
          entityType: 'TEAM_ASSIGNMENT',
          entityId: assignment.id,
          actorType: actor.actorType,
          actorLabel: actor.actorLabel,
          changeSummary: 'Ended team assignment.',
          requestId: actor.requestId,
        })
        continue
      }

      if (
        assignment.isPrimary !== shouldBePrimary ||
        assignment.position !== value.position
      ) {
        await tx
          .update(personTeamAssignments)
          .set({
            isPrimary: shouldBePrimary,
            position: value.position,
            updatedAt: new Date(),
          })
          .where(eq(personTeamAssignments.id, assignment.id))
        await insertAuditEvent(tx, {
          eventType: 'TEAM_ASSIGNMENT_UPDATED',
          entityType: 'TEAM_ASSIGNMENT',
          entityId: assignment.id,
          actorType: actor.actorType,
          actorLabel: actor.actorLabel,
          changeSummary: shouldBePrimary
            ? 'Updated primary team assignment.'
            : 'Updated team assignment.',
          requestId: actor.requestId,
        })
      }
      desiredTeamIds.delete(assignment.teamId)
    }

    for (const teamId of desiredTeamIds) {
      const [created] = await tx
        .insert(personTeamAssignments)
        .values({
          personId,
          teamId,
          position: value.position,
          isPrimary: teamId === value.primaryTeamId,
          status: 'ACTIVE',
          assignedByActor: actor.actorLabel ?? actor.actorType,
        })
        .returning()
      await insertAuditEvent(tx, {
        eventType: 'TEAM_ASSIGNMENT_CREATED',
        entityType: 'TEAM_ASSIGNMENT',
        entityId: created.id,
        actorType: actor.actorType,
        actorLabel: actor.actorLabel,
        changeSummary:
          teamId === value.primaryTeamId
            ? 'Created primary team assignment.'
            : 'Created additional team assignment.',
        requestId: actor.requestId,
      })
    }

    await insertAuditEvent(tx, {
      eventType: 'PERSON_UPDATED',
      entityType: 'PERSON',
      entityId: personId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: `Updated contact ${value.person.displayName}.`,
      metadata: {
        locationId,
        primaryTeamId: value.primaryTeamId,
      },
      requestId: actor.requestId,
    })

    if (previousStatus !== value.person.status) {
      await insertAuditEvent(tx, {
        eventType: 'PERSON_STATUS_CHANGED',
        entityType: 'PERSON',
        entityId: personId,
        actorType: actor.actorType,
        actorLabel: actor.actorLabel,
        changeSummary: `Status changed from ${previousStatus} to ${value.person.status}.`,
        metadata: { from: previousStatus, to: value.person.status },
        requestId: actor.requestId,
      })
    }
  })

  return {
    status: 'created',
    personId,
    displayName: value.person.displayName,
  }
}
