import { and, eq, inArray, isNull, notInArray } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  locations,
  people,
  personContactMethods,
  personLocationAffiliations,
  personMergeHistory,
  personTeamAssignments,
  teams,
} from '../db/schema.ts'
import { findDuplicatePairs } from '../domain/pairDuplicates.ts'

export type DuplicateQueueItem = {
  key: string
  result: 'EXACT_MATCH' | 'LIKELY_MATCH' | 'POSSIBLE_MATCH'
  reasons: string[]
  suggestedSurvivorId: string
  left: DuplicateQueuePerson
  right: DuplicateQueuePerson
}

export type DuplicateQueuePerson = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  source: string
  createdAt: string
  email: string | null
  phone: string | null
  location: { id: string; code: string; name: string } | null
  primaryTeam: { id: string; name: string; slug: string; position: string } | null
}

async function loadPeopleForScan(db: AycDatabase) {
  const alreadyMerged = await db
    .select({ id: personMergeHistory.mergedPersonId })
    .from(personMergeHistory)

  const mergedIds = alreadyMerged.map((row) => row.id)

  const personRows =
    mergedIds.length > 0
      ? await db.select().from(people).where(notInArray(people.id, mergedIds))
      : await db.select().from(people)

  if (personRows.length === 0) return []

  const ids = personRows.map((p) => p.id)

  const methods = await db
    .select()
    .from(personContactMethods)
    .where(
      and(inArray(personContactMethods.personId, ids), isNull(personContactMethods.archivedAt)),
    )

  const affiliations = await db
    .select({
      personId: personLocationAffiliations.personId,
      locationId: locations.id,
      code: locations.code,
      name: locations.name,
    })
    .from(personLocationAffiliations)
    .innerJoin(locations, eq(locations.id, personLocationAffiliations.locationId))
    .where(
      and(
        inArray(personLocationAffiliations.personId, ids),
        eq(personLocationAffiliations.isPrimary, true),
        eq(personLocationAffiliations.status, 'ACTIVE'),
      ),
    )

  const assignments = await db
    .select({
      personId: personTeamAssignments.personId,
      teamId: teams.id,
      name: teams.name,
      slug: teams.slug,
      position: personTeamAssignments.position,
      isPrimary: personTeamAssignments.isPrimary,
    })
    .from(personTeamAssignments)
    .innerJoin(teams, eq(teams.id, personTeamAssignments.teamId))
    .where(
      and(
        inArray(personTeamAssignments.personId, ids),
        eq(personTeamAssignments.status, 'ACTIVE'),
      ),
    )

  return personRows.map((person) => {
    const personMethods = methods.filter((m) => m.personId === person.id)
    const emails = personMethods
      .filter((m) => m.contactType === 'EMAIL')
      .map((m) => m.normalizedValue)
    const phones = personMethods
      .filter((m) => m.contactType === 'MOBILE_PHONE')
      .map((m) => m.normalizedValue)
    const affiliation = affiliations.find((a) => a.personId === person.id) ?? null
    const personAssignments = assignments.filter((a) => a.personId === person.id)
    const primary = personAssignments.find((a) => a.isPrimary) ?? personAssignments[0] ?? null
    const emailRaw =
      personMethods.find((m) => m.contactType === 'EMAIL' && m.isPrimary)?.contactValue ??
      personMethods.find((m) => m.contactType === 'EMAIL')?.contactValue ??
      null
    const phoneRaw =
      personMethods.find((m) => m.contactType === 'MOBILE_PHONE' && m.isPrimary)?.contactValue ??
      personMethods.find((m) => m.contactType === 'MOBILE_PHONE')?.contactValue ??
      null

    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      preferredName: person.preferredName,
      displayName:
        person.displayName ??
        [person.preferredName || person.firstName, person.lastName].filter(Boolean).join(' '),
      status: person.status,
      source: person.source,
      createdAt: person.createdAt,
      emails,
      phones,
      emailRaw,
      phoneRaw,
      primaryLocationId: affiliation?.locationId ?? null,
      location: affiliation
        ? { id: affiliation.locationId, code: affiliation.code, name: affiliation.name }
        : null,
      teamIds: personAssignments.map((a) => a.teamId),
      primaryTeam: primary
        ? {
            id: primary.teamId,
            name: primary.name,
            slug: primary.slug,
            position: primary.position,
          }
        : null,
    }
  })
}

function toQueuePerson(
  person: Awaited<ReturnType<typeof loadPeopleForScan>>[number],
): DuplicateQueuePerson {
  return {
    id: person.id,
    displayName: person.displayName,
    firstName: person.firstName,
    lastName: person.lastName,
    preferredName: person.preferredName,
    status: person.status,
    source: person.source,
    createdAt: person.createdAt.toISOString(),
    email: person.emailRaw,
    phone: person.phoneRaw,
    location: person.location,
    primaryTeam: person.primaryTeam,
  }
}

export async function listDuplicateQueue(db: AycDatabase): Promise<{
  total: number
  exact: number
  likely: number
  possible: number
  items: DuplicateQueueItem[]
}> {
  const scanned = await loadPeopleForScan(db)
  const byId = new Map(scanned.map((p) => [p.id, p]))
  const pairs = findDuplicatePairs(scanned, { maxPairs: 100 })

  const items: DuplicateQueueItem[] = pairs
    .map((pair) => {
      const left = byId.get(pair.leftId)
      const right = byId.get(pair.rightId)
      if (!left || !right) return null
      return {
        key: `${pair.leftId}:${pair.rightId}`,
        result: pair.result,
        reasons: pair.reasons,
        suggestedSurvivorId: pair.suggestedSurvivorId,
        left: toQueuePerson(left),
        right: toQueuePerson(right),
      }
    })
    .filter((item): item is DuplicateQueueItem => Boolean(item))

  return {
    total: items.length,
    exact: items.filter((i) => i.result === 'EXACT_MATCH').length,
    likely: items.filter((i) => i.result === 'LIKELY_MATCH').length,
    possible: items.filter((i) => i.result === 'POSSIBLE_MATCH').length,
    items,
  }
}
