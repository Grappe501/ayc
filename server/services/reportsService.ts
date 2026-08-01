import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  locations,
  membershipApplications,
  people,
  personLeadershipRoles,
  personLocationAffiliations,
  personTeamAssignments,
  teams,
} from '../db/schema.ts'
import {
  buildLocationCoverage,
  tallyApplicationStatuses,
  type LocationCoverageRow,
} from '../domain/reports.ts'
import { getLeaderBoardStats } from './leaderStats.ts'
import { listLeaderRoster } from './leaderRoster.ts'
import { listTeamAttentionDigests } from './teamDigestService.ts'

function serializePerson(row: {
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  status: string
  source: string
  createdAt: Date
}) {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    preferredName: row.preferredName,
    displayName:
      row.preferredName?.trim() || `${row.firstName} ${row.lastName}`.trim(),
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getLeaderReports(db: AycDatabase) {
  const [summary, digests, roster] = await Promise.all([
    getLeaderBoardStats(db),
    listTeamAttentionDigests(db),
    listLeaderRoster(db, { status: 'ALL' }),
  ])

  const applicationStatusRows = await db
    .select({ status: membershipApplications.status })
    .from(membershipApplications)
  const applicationPipeline = tallyApplicationStatuses(
    applicationStatusRows.map((row) => row.status),
  )

  const recentApplications = await db
    .select({
      id: membershipApplications.id,
      referenceCode: membershipApplications.referenceCode,
      status: membershipApplications.status,
      firstName: membershipApplications.firstName,
      lastName: membershipApplications.lastName,
      email: membershipApplications.email,
      primaryTeamInterest: membershipApplications.primaryTeamInterest,
      locationInterestType: membershipApplications.locationInterestType,
      wantsToLeadLocal: membershipApplications.wantsToLeadLocal,
      wantsCategoryLead: membershipApplications.wantsCategoryLead,
      createdAt: membershipApplications.createdAt,
      assignedToPersonId: membershipApplications.assignedToPersonId,
    })
    .from(membershipApplications)
    .orderBy(desc(membershipApplications.createdAt))
    .limit(20)

  const recentJoinPeople = await db
    .select({
      id: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      status: people.status,
      source: people.source,
      createdAt: people.createdAt,
    })
    .from(people)
    .where(and(eq(people.source, 'JOIN_FORM'), isNull(people.archivedAt)))
    .orderBy(desc(people.createdAt))
    .limit(15)

  const recentAssignments = await db
    .select({
      id: personTeamAssignments.id,
      personId: personTeamAssignments.personId,
      position: personTeamAssignments.position,
      status: personTeamAssignments.status,
      createdAt: personTeamAssignments.createdAt,
      firstName: people.firstName,
      lastName: people.lastName,
      preferredName: people.preferredName,
      teamName: teams.name,
      teamSlug: teams.slug,
    })
    .from(personTeamAssignments)
    .innerJoin(people, eq(people.id, personTeamAssignments.personId))
    .innerJoin(teams, eq(teams.id, personTeamAssignments.teamId))
    .where(eq(personTeamAssignments.status, 'ACTIVE'))
    .orderBy(desc(personTeamAssignments.createdAt))
    .limit(15)

  const allLocations = await db
    .select({
      id: locations.id,
      code: locations.code,
      name: locations.name,
      locationType: locations.locationType,
    })
    .from(locations)
    .where(and(eq(locations.active, true), isNull(locations.archivedAt)))
    .orderBy(locations.name)

  const locationLeadRows = await db
    .select({
      locationId: personLeadershipRoles.locationId,
    })
    .from(personLeadershipRoles)
    .where(
      and(
        eq(personLeadershipRoles.roleCode, 'LOCATION_LEAD'),
        isNull(personLeadershipRoles.revokedAt),
      ),
    )

  const locationsWithLead = new Set(
    locationLeadRows
      .map((row) => row.locationId)
      .filter((id): id is string => Boolean(id)),
  )

  const rosterByLocation = new Map<
    string,
    { count: number; localLead: number; ready: number; categoryLead: number }
  >()
  for (const person of roster.people) {
    if (!person.location) continue
    const bucket = rosterByLocation.get(person.location.id) ?? {
      count: 0,
      localLead: 0,
      ready: 0,
      categoryLead: 0,
    }
    bucket.count += 1
    if (person.pipelineTags.includes('LOCAL_LEAD_CANDIDATE')) bucket.localLead += 1
    if (person.pipelineTags.includes('READY_TO_LEAD')) bucket.ready += 1
    if (person.pipelineTags.includes('CATEGORY_LEAD_CANDIDATE')) {
      bucket.categoryLead += 1
    }
    if (person.primaryTeam?.position === 'LEAD') bucket.categoryLead += 1
    rosterByLocation.set(person.location.id, bucket)
  }

  const locationCoverage: LocationCoverageRow[] = buildLocationCoverage(
    allLocations.map((location) => {
      const bucket = rosterByLocation.get(location.id)
      return {
        id: location.id,
        code: location.code,
        name: location.name,
        locationType: location.locationType,
        hasLocationLeadRole: locationsWithLead.has(location.id),
        rosterCount: bucket?.count ?? 0,
        localLeadCandidates: bucket?.localLead ?? 0,
        readyToLead: bucket?.ready ?? 0,
        categoryLeadsOnRoster: bucket?.categoryLead ?? 0,
      }
    }),
  )

  const thinLocations = locationCoverage.filter((row) => row.thin)
  const thinBySegment = {
    highSchool: thinLocations.filter((row) => row.locationType === 'HIGH_SCHOOL')
      .length,
    workingClass: thinLocations.filter((row) => row.locationType === 'COUNTY')
      .length,
    college: thinLocations.filter((row) => row.locationType === 'COLLEGE').length,
  }

  const teamsWithoutLead = digests.digests.filter((team) => team.noLead)
  const thinCategoryTeams = digests.digests.filter(
    (team) => team.noLead || team.openItems > 0,
  )

  // Locations with people but no primary affiliation count (sanity).
  const [affiliatedLocations] = await db
    .select({ value: sql<number>`count(distinct ${personLocationAffiliations.locationId})::int` })
    .from(personLocationAffiliations)
    .where(
      and(
        eq(personLocationAffiliations.isPrimary, true),
        eq(personLocationAffiliations.status, 'ACTIVE'),
      ),
    )

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      ...summary,
      locationsWithPeople: affiliatedLocations?.value ?? 0,
      openApplications: applicationPipeline.open,
      thinLocations: thinLocations.length,
      teamsWithoutLead: teamsWithoutLead.length,
      totalOpenTeamItems: digests.totalOpenItems,
    },
    applicationPipeline,
    recentApplications: recentApplications.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    recentJoinPeople: recentJoinPeople.map(serializePerson),
    recentAssignments: recentAssignments.map((row) => ({
      id: row.id,
      personId: row.personId,
      displayName:
        row.preferredName?.trim() || `${row.firstName} ${row.lastName}`.trim(),
      position: row.position,
      teamName: row.teamName,
      teamSlug: row.teamSlug,
      createdAt: row.createdAt.toISOString(),
    })),
    attention: roster.attention,
    teamCoverage: {
      teamsNeedingAttention: digests.teamsNeedingAttention,
      totalOpenItems: digests.totalOpenItems,
      digests: digests.digests.map((team) => ({
        slug: team.slug,
        name: team.name,
        mark: team.mark,
        roster: team.roster,
        leads: team.leads,
        noLead: team.noLead,
        openItems: team.openItems,
        topIssues: team.topIssues,
        prospective: team.prospective,
        joinForm: team.joinForm,
        missingContact: team.missingContact,
      })),
      thinCategoryTeams: thinCategoryTeams.map((team) => team.slug),
    },
    locationCoverage: {
      totalLocations: locationCoverage.length,
      thinCount: thinLocations.length,
      thinBySegment,
      thinFormalLeadCount: locationCoverage.filter((row) => row.thinFormalLead)
        .length,
      thinPipelineCount: locationCoverage.filter((row) => row.thinPipeline).length,
      locations: locationCoverage.slice(0, 60),
    },
  }
}
