import type { AycDatabase } from '../db/client.ts'
import {
  assessDuplicates,
  type DuplicateCandidate,
  shouldBlockCreation,
} from '../domain/duplicates.ts'
import { normalizeEmail, normalizePhone } from '../domain/normalize.ts'
import {
  validateContactCreate,
  type ContactCreateInput,
  type ValidatedContactCreate,
} from '../domain/validateContact.ts'
import { createLocation, findLocationByTypeAndCode } from '../repos/locations.ts'
import {
  createContactRecord,
  findPeopleByName,
  findPeopleByNormalizedContact,
  type ActorContext,
} from '../repos/people.ts'
import { getTeamById } from '../repos/teams.ts'
import {
  people,
  personContactMethods,
  personLocationAffiliations,
  personTeamAssignments,
} from '../db/schema.ts'
import { and, eq, isNull } from 'drizzle-orm'

export type ContactCreateRequest = ContactCreateInput & {
  confirmDuplicate?: boolean
  forceCreateDespiteExact?: boolean
}

export type ContactCreateResult =
  | { status: 'created'; personId: string; displayName: string }
  | {
      status: 'duplicate_review'
      result: 'POSSIBLE_MATCH' | 'LIKELY_MATCH' | 'EXACT_MATCH'
      candidates: Array<{
        id: string
        firstName: string
        lastName: string
        preferredName: string | null
        status: string
        emails: string[]
        phones: string[]
      }>
      reasons: string[]
    }

async function loadDuplicateCandidates(
  db: AycDatabase,
  validated: ValidatedContactCreate,
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
      emails: methods
        .filter((m) => m.contactType === 'EMAIL')
        .map((m) => m.normalizedValue),
      phones: methods
        .filter((m) => m.contactType === 'MOBILE_PHONE')
        .map((m) => m.normalizedValue),
      primaryLocationId: affiliation[0]?.locationId ?? null,
      teamIds: assignments.map((a) => a.teamId),
    })
  }

  return candidates
}

export async function createContact(
  db: AycDatabase,
  input: ContactCreateRequest,
  actor: ActorContext,
): Promise<ContactCreateResult> {
  const validated = validateContactCreate(input)
  if (!validated.ok) {
    const err = new Error('VALIDATION_ERROR') as Error & {
      code: 'VALIDATION_ERROR'
      fields: Record<string, string>
    }
    err.code = 'VALIDATION_ERROR'
    err.fields = Object.fromEntries(validated.issues.map((i) => [i.field, i.message]))
    throw err
  }

  const value = validated.value

  const primaryTeam = await getTeamById(db, value.primaryTeamId)
  if (!primaryTeam || !primaryTeam.active) {
    const err = new Error('VALIDATION_ERROR') as Error & {
      code: 'VALIDATION_ERROR'
      fields: Record<string, string>
    }
    err.code = 'VALIDATION_ERROR'
    err.fields = { primaryTeamId: 'Primary team was not found.' }
    throw err
  }

  for (const teamId of value.additionalTeamIds) {
    const team = await getTeamById(db, teamId)
    if (!team || !team.active) {
      const err = new Error('VALIDATION_ERROR') as Error & {
        code: 'VALIDATION_ERROR'
        fields: Record<string, string>
      }
      err.code = 'VALIDATION_ERROR'
      err.fields = { additionalTeamIds: 'One or more additional teams were not found.' }
      throw err
    }
  }

  const candidates = await loadDuplicateCandidates(db, value)
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

    if (blockExact || needsConfirm || (assessment.result === 'EXACT_MATCH' && !input.forceCreateDespiteExact)) {
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
            emails: c.emails.map((e) => maskEmail(e)),
            phones: c.phones.map((p) => maskPhone(p)),
          })),
      }
    }
  }

  let locationId = value.location.id
  if (!locationId) {
    const existing = await findLocationByTypeAndCode(
      db,
      value.location.locationType,
      value.location.code,
    )
    if (existing) {
      locationId = existing.id
    } else {
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
      locationId = created.id
    }
  }

  const person = await createContactRecord(
    db,
    { ...value, locationId },
    actor,
  )

  return {
    status: 'created',
    personId: person.id,
    displayName: person.displayName ?? `${person.firstName} ${person.lastName}`,
  }
}

function maskEmail(email: string): string {
  const normalized = normalizeEmail(email)
  const [local, domain] = normalized.split('@')
  if (!domain) return '***'
  const shown = local.slice(0, 1)
  return `${shown}***@${domain}`
}

function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length < 4) return '***'
  return `***-***-${normalized.slice(-4)}`
}
