import { and, desc, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  locations,
  people,
  personContactMethods,
  personLocationAffiliations,
  personTeamAssignments,
  teams,
} from '../db/schema.ts'
import { listAuditEventsForEntity } from './audit.ts'

export type ContactDetail = {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  preferredName: string | null
  displayName: string | null
  status: string
  source: string
  preferredContactMethod: string | null
  createdAt: Date
  updatedAt: Date
  archivedAt: Date | null
  email: { value: string; normalized: string; isVerified: boolean } | null
  phone: { value: string; normalized: string; isVerified: boolean } | null
  location: {
    id: string
    name: string
    code: string
    compositeCode: string
    locationType: string
    city: string | null
    countyName: string | null
    affiliationType: string
  } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
    position: string
    status: string
  } | null
  additionalTeams: Array<{
    id: string
    name: string
    slug: string
    position: string
    status: string
  }>
  recentAudit: Array<{
    id: string
    eventType: string
    changeSummary: string
    createdAt: Date
  }>
}

export async function getContactDetail(
  db: AycDatabase,
  personId: string,
): Promise<ContactDetail | null> {
  const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1)
  if (!person) return null

  const methods = await db
    .select()
    .from(personContactMethods)
    .where(
      and(eq(personContactMethods.personId, personId), isNull(personContactMethods.archivedAt)),
    )

  const emailRow = methods.find((m) => m.contactType === 'EMAIL' && m.isPrimary) ??
    methods.find((m) => m.contactType === 'EMAIL')
  const phoneRow =
    methods.find((m) => m.contactType === 'MOBILE_PHONE' && m.isPrimary) ??
    methods.find((m) => m.contactType === 'MOBILE_PHONE')

  const [affiliation] = await db
    .select({
      affiliationType: personLocationAffiliations.affiliationType,
      locationId: locations.id,
      name: locations.name,
      code: locations.code,
      compositeCode: locations.compositeCode,
      locationType: locations.locationType,
      city: locations.city,
      countyName: locations.countyName,
    })
    .from(personLocationAffiliations)
    .innerJoin(locations, eq(locations.id, personLocationAffiliations.locationId))
    .where(
      and(
        eq(personLocationAffiliations.personId, personId),
        eq(personLocationAffiliations.isPrimary, true),
        eq(personLocationAffiliations.status, 'ACTIVE'),
      ),
    )
    .limit(1)

  const assignments = await db
    .select({
      teamId: teams.id,
      name: teams.name,
      slug: teams.slug,
      position: personTeamAssignments.position,
      status: personTeamAssignments.status,
      isPrimary: personTeamAssignments.isPrimary,
    })
    .from(personTeamAssignments)
    .innerJoin(teams, eq(teams.id, personTeamAssignments.teamId))
    .where(
      and(
        eq(personTeamAssignments.personId, personId),
        eq(personTeamAssignments.status, 'ACTIVE'),
      ),
    )
    .orderBy(desc(personTeamAssignments.isPrimary))

  const primaryTeamRow = assignments.find((a) => a.isPrimary) ?? null
  const additionalTeams = assignments
    .filter((a) => !a.isPrimary)
    .map((a) => ({
      id: a.teamId,
      name: a.name,
      slug: a.slug,
      position: a.position,
      status: a.status,
    }))

  const audit = await listAuditEventsForEntity(db, 'PERSON', personId)

  return {
    id: person.id,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    preferredName: person.preferredName,
    displayName: person.displayName,
    status: person.status,
    source: person.source,
    preferredContactMethod: person.preferredContactMethod,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
    archivedAt: person.archivedAt,
    email: emailRow
      ? {
          value: emailRow.contactValue,
          normalized: emailRow.normalizedValue,
          isVerified: emailRow.isVerified,
        }
      : null,
    phone: phoneRow
      ? {
          value: phoneRow.contactValue,
          normalized: phoneRow.normalizedValue,
          isVerified: phoneRow.isVerified,
        }
      : null,
    location: affiliation
      ? {
          id: affiliation.locationId,
          name: affiliation.name,
          code: affiliation.code,
          compositeCode: affiliation.compositeCode,
          locationType: affiliation.locationType,
          city: affiliation.city,
          countyName: affiliation.countyName,
          affiliationType: affiliation.affiliationType,
        }
      : null,
    primaryTeam: primaryTeamRow
      ? {
          id: primaryTeamRow.teamId,
          name: primaryTeamRow.name,
          slug: primaryTeamRow.slug,
          position: primaryTeamRow.position,
          status: primaryTeamRow.status,
        }
      : null,
    additionalTeams,
    recentAudit: audit.slice(0, 10).map((event) => ({
      id: event.id,
      eventType: event.eventType,
      changeSummary: event.changeSummary,
      createdAt: event.createdAt,
    })),
  }
}
