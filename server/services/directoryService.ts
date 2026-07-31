import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { presentContactMethods } from '../domain/maskContact.ts'
import type { LocationType, PersonStatus, TeamPosition } from '../domain/enums.ts'
import {
  locations,
  people,
  personContactMethods,
  personLocationAffiliations,
  personTeamAssignments,
  teams,
} from '../db/schema.ts'
import { getLeaderBoardStats } from './leaderStats.ts'
import { CANONICAL_TEAMS } from '../domain/enums.ts'

export type DirectorySort = 'name' | 'location' | 'team' | 'recent'

export type DirectoryPeopleFilters = {
  q?: string
  locationType?: LocationType
  locationId?: string
  teamSlug?: string
  position?: TeamPosition
  status?: PersonStatus | 'ALL'
  sort?: DirectorySort
}

export type DirectoryPersonRow = {
  id: string
  displayName: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  position: string | null
  location: {
    id: string
    code: string
    name: string
    locationType: string
  } | null
  primaryTeam: {
    id: string
    name: string
    slug: string
  } | null
  email: string | null
  phone: string | null
  contactRevealed: boolean
  createdAt: Date
}

export async function getDirectorySummary(db: AycDatabase) {
  const stats = await getLeaderBoardStats(db)
  return {
    activePeople: stats.activePeople,
    leads: stats.leads,
    volunteers: stats.volunteers,
    locations: stats.locationsRepresented,
  }
}

type RawRow = {
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  displayName: string | null
  status: string
  createdAt: Date
  locationId: string | null
  locationCode: string | null
  locationName: string | null
  locationType: string | null
  teamId: string | null
  teamName: string | null
  teamSlug: string | null
  position: string | null
}

async function loadPeopleRows(db: AycDatabase, filters: DirectoryPeopleFilters): Promise<RawRow[]> {
  const status = filters.status ?? 'ACTIVE'

  const rows = await db
    .select({
      id: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      displayName: people.displayName,
      status: people.status,
      createdAt: people.createdAt,
      locationId: locations.id,
      locationCode: locations.code,
      locationName: locations.name,
      locationType: locations.locationType,
      teamId: teams.id,
      teamName: teams.name,
      teamSlug: teams.slug,
      position: personTeamAssignments.position,
    })
    .from(people)
    .leftJoin(
      personLocationAffiliations,
      and(
        eq(personLocationAffiliations.personId, people.id),
        eq(personLocationAffiliations.isPrimary, true),
        eq(personLocationAffiliations.status, 'ACTIVE'),
      ),
    )
    .leftJoin(locations, eq(locations.id, personLocationAffiliations.locationId))
    .leftJoin(
      personTeamAssignments,
      and(
        eq(personTeamAssignments.personId, people.id),
        eq(personTeamAssignments.isPrimary, true),
        eq(personTeamAssignments.status, 'ACTIVE'),
      ),
    )
    .leftJoin(teams, eq(teams.id, personTeamAssignments.teamId))
    .orderBy(asc(people.lastName), asc(people.firstName))

  if (status === 'ALL') return rows
  if (status === 'ARCHIVED') return rows.filter((row) => row.status === 'ARCHIVED')
  return rows.filter((row) => row.status === status)
}

function matchesQuery(row: RawRow, q: string): boolean {
  const haystack = [
    row.firstName,
    row.lastName,
    row.preferredName,
    row.displayName,
    row.locationName,
    row.locationCode,
    row.teamName,
    row.teamSlug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export async function searchDirectoryPeople(
  db: AycDatabase,
  filters: DirectoryPeopleFilters,
  revealContact: boolean,
): Promise<{ total: number; people: DirectoryPersonRow[] }> {
  let rows = await loadPeopleRows(db, filters)

  if (filters.locationType) {
    rows = rows.filter((row) => row.locationType === filters.locationType)
  }
  if (filters.locationId) {
    rows = rows.filter((row) => row.locationId === filters.locationId)
  }
  if (filters.teamSlug) {
    rows = rows.filter((row) => row.teamSlug === filters.teamSlug)
  }
  if (filters.position) {
    rows = rows.filter((row) => row.position === filters.position)
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase()
    rows = rows.filter((row) => matchesQuery(row, q))
  }

  const sort = filters.sort ?? 'name'
  rows = [...rows].sort((a, b) => {
    if (sort === 'recent') {
      return b.createdAt.getTime() - a.createdAt.getTime()
    }
    if (sort === 'location') {
      return (a.locationName ?? '').localeCompare(b.locationName ?? '') ||
        a.lastName.localeCompare(b.lastName)
    }
    if (sort === 'team') {
      return (a.teamName ?? '').localeCompare(b.teamName ?? '') ||
        a.lastName.localeCompare(b.lastName)
    }
    return (
      a.lastName.localeCompare(b.lastName) ||
      a.firstName.localeCompare(b.firstName)
    )
  })

  const contactMap = new Map<string, { email: string | null; phone: string | null }>()
  const personIds = new Set(rows.map((row) => row.id))
  const allMethods = await db
    .select()
    .from(personContactMethods)
    .where(
      and(isNull(personContactMethods.archivedAt), eq(personContactMethods.isPrimary, true)),
    )

  for (const method of allMethods) {
    if (!personIds.has(method.personId)) continue
    const current = contactMap.get(method.personId) ?? { email: null, phone: null }
    if (method.contactType === 'EMAIL') current.email = method.contactValue
    if (method.contactType === 'MOBILE_PHONE') current.phone = method.contactValue
    contactMap.set(method.personId, current)
  }

  const peopleRows: DirectoryPersonRow[] = rows.map((row) => {
    const contact = contactMap.get(row.id) ?? { email: null, phone: null }
    const presented = presentContactMethods(contact.email, contact.phone, revealContact)
    return {
      id: row.id,
      displayName:
        row.displayName ??
        `${row.preferredName || row.firstName} ${row.lastName}`.trim(),
      firstName: row.firstName,
      lastName: row.lastName,
      preferredName: row.preferredName,
      status: row.status,
      position: row.position,
      location:
        row.locationId && row.locationCode && row.locationName && row.locationType
          ? {
              id: row.locationId,
              code: row.locationCode,
              name: row.locationName,
              locationType: row.locationType,
            }
          : null,
      primaryTeam:
        row.teamId && row.teamName && row.teamSlug
          ? { id: row.teamId, name: row.teamName, slug: row.teamSlug }
          : null,
      email: presented.email,
      phone: presented.phone,
      contactRevealed: presented.revealed,
      createdAt: row.createdAt,
    }
  })

  return { total: peopleRows.length, people: peopleRows }
}

export async function getDirectoryTeams(db: AycDatabase) {
  const { people: activePeople } = await searchDirectoryPeople(
    db,
    { status: 'ACTIVE' },
    false,
  )

  return CANONICAL_TEAMS.map((team) => {
    const members = activePeople.filter((p) => p.primaryTeam?.slug === team.slug)
    const leads = members.filter((p) => p.position === 'LEAD').length
    const volunteers = members.filter((p) => p.position === 'VOLUNTEER').length
    const locationIds = new Set(
      members.map((p) => p.location?.id).filter(Boolean) as string[],
    )
    return {
      name: team.name,
      slug: team.slug,
      code: team.code,
      description: team.description,
      activePeople: members.length,
      leads,
      volunteers,
      locationsRepresented: locationIds.size,
    }
  })
}

export async function getDirectoryLocations(db: AycDatabase) {
  const activeLocations = await db
    .select()
    .from(locations)
    .where(and(eq(locations.active, true), isNull(locations.archivedAt)))
    .orderBy(asc(locations.locationType), asc(locations.name))

  const { people: activePeople } = await searchDirectoryPeople(
    db,
    { status: 'ACTIVE' },
    false,
  )

  return activeLocations.map((location) => {
    const members = activePeople.filter((p) => p.location?.id === location.id)
    const leads = members.filter((p) => p.position === 'LEAD').length
    const teamSlugs = new Set(
      members.map((p) => p.primaryTeam?.slug).filter(Boolean) as string[],
    )
    return {
      id: location.id,
      code: location.code,
      compositeCode: location.compositeCode,
      name: location.name,
      locationType: location.locationType,
      city: location.city,
      countyName: location.countyName,
      activePeople: members.length,
      leads,
      teamsRepresented: teamSlugs.size,
    }
  })
}

export async function getDirectoryPersonDetail(
  db: AycDatabase,
  personId: string,
  revealContact: boolean,
) {
  const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1)
  if (!person) return null

  const methods = await db
    .select()
    .from(personContactMethods)
    .where(
      and(eq(personContactMethods.personId, personId), isNull(personContactMethods.archivedAt)),
    )
  const email = methods.find((m) => m.contactType === 'EMAIL' && m.isPrimary)?.contactValue ?? null
  const phone =
    methods.find((m) => m.contactType === 'MOBILE_PHONE' && m.isPrimary)?.contactValue ?? null
  const presented = presentContactMethods(email, phone, revealContact)

  const [affiliation] = await db
    .select({
      locationId: locations.id,
      name: locations.name,
      code: locations.code,
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

  const primary = assignments.find((a) => a.isPrimary) ?? null

  return {
    id: person.id,
    displayName:
      person.displayName ??
      `${person.preferredName || person.firstName} ${person.lastName}`.trim(),
    firstName: person.firstName,
    lastName: person.lastName,
    preferredName: person.preferredName,
    status: person.status,
    preferredContactMethod: person.preferredContactMethod,
    email: presented.email,
    phone: presented.phone,
    contactRevealed: presented.revealed,
    hasContactMethods: Boolean(email || phone),
    location: affiliation
      ? {
          id: affiliation.locationId,
          name: affiliation.name,
          code: affiliation.code,
          locationType: affiliation.locationType,
          city: affiliation.city,
          countyName: affiliation.countyName,
        }
      : null,
    primaryTeam: primary
      ? {
          id: primary.teamId,
          name: primary.name,
          slug: primary.slug,
          position: primary.position,
        }
      : null,
    additionalTeams: assignments
      .filter((a) => !a.isPrimary)
      .map((a) => ({
        id: a.teamId,
        name: a.name,
        slug: a.slug,
        position: a.position,
      })),
  }
}

export async function listDirectoryFilterOptions(db: AycDatabase) {
  const activeLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      code: locations.code,
      locationType: locations.locationType,
    })
    .from(locations)
    .where(and(eq(locations.active, true), isNull(locations.archivedAt)))
    .orderBy(asc(locations.name))

  const activeTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
    })
    .from(teams)
    .where(eq(teams.active, true))
    .orderBy(asc(teams.displayOrder))

  return { locations: activeLocations, teams: activeTeams }
}
