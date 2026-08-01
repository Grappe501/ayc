import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { boards, locations, teams } from '../db/schema.ts'
import type { LocationType } from '../domain/enums.ts'
import {
  LOCATION_CATEGORY_SLUGS,
  locationCategoryBoardSlug,
  locationTeamBoardSlug,
  parentBoardSlugForLocationType,
  segmentForLocationType,
} from '../domain/locationBoards.ts'

export type EnsureLocationBoardsResult = {
  locationId: string
  teamBoardId: string
  categoryBoardIds: string[]
  created: number
}

async function findBoardBySlug(db: AycDatabase, slug: string) {
  const [row] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.slug, slug), isNull(boards.archivedAt)))
    .limit(1)
  return row ?? null
}

/**
 * Idempotently create LOCATION_TEAM + five LOCATION_CATEGORY boards for a location.
 */
export async function ensureLocationBoards(
  db: AycDatabase,
  locationId: string,
): Promise<EnsureLocationBoardsResult> {
  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, locationId), isNull(locations.archivedAt)))
    .limit(1)

  if (!location) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Location not found.',
    })
  }

  const locationType = location.locationType as LocationType
  const parentSlug = parentBoardSlugForLocationType(locationType)
  const parent = await findBoardBySlug(db, parentSlug)
  if (!parent) {
    throw Object.assign(new Error('INTERNAL_ERROR'), {
      code: 'INTERNAL_ERROR' as const,
      message: `Parent board ${parentSlug} is missing from the registry.`,
    })
  }

  let created = 0
  const teamSlug = locationTeamBoardSlug(location.compositeCode)
  let teamBoard = await findBoardBySlug(db, teamSlug)
  if (!teamBoard) {
    const [inserted] = await db
      .insert(boards)
      .values({
        kind: 'LOCATION_TEAM',
        slug: teamSlug,
        name: `${location.name} Team Board`,
        parentBoardId: parent.id,
        locationId: location.id,
        segment: segmentForLocationType(locationType),
        displayOrder: 100,
        active: true,
      })
      .returning()
    teamBoard = inserted
    created += 1
  }

  const categoryBoardIds: string[] = []
  for (const categorySlug of LOCATION_CATEGORY_SLUGS) {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, categorySlug))
      .limit(1)
    if (!team) continue

    const statewide = await findBoardBySlug(db, categorySlug)
    const boardSlug = locationCategoryBoardSlug(location.compositeCode, categorySlug)
    let categoryBoard = await findBoardBySlug(db, boardSlug)
    if (!categoryBoard) {
      const [inserted] = await db
        .insert(boards)
        .values({
          kind: 'LOCATION_CATEGORY',
          slug: boardSlug,
          name: `${location.name} ${team.name}`,
          parentBoardId: statewide?.id ?? teamBoard.id,
          teamId: team.id,
          locationId: location.id,
          segment: segmentForLocationType(locationType),
          displayOrder: team.displayOrder,
          active: true,
        })
        .returning()
      categoryBoard = inserted
      created += 1
    }
    categoryBoardIds.push(categoryBoard.id)
  }

  return {
    locationId: location.id,
    teamBoardId: teamBoard.id,
    categoryBoardIds,
    created,
  }
}

export async function ensureLocationBoardsForAll(db: AycDatabase): Promise<{
  locations: number
  boardsCreated: number
}> {
  const active = await db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.active, true), isNull(locations.archivedAt)))

  let boardsCreated = 0
  for (const row of active) {
    const result = await ensureLocationBoards(db, row.id)
    boardsCreated += result.created
  }
  return { locations: active.length, boardsCreated }
}
