import type { Handler } from '@netlify/functions'
import type { LocationType, PersonStatus, TeamPosition } from '../../server/domain/enums.ts'
import {
  LOCATION_TYPES,
  PERSON_STATUSES,
  TEAM_POSITIONS,
} from '../../server/domain/enums.ts'
import { fail, methodNotAllowed, ok } from '../../server/http/response.ts'
import {
  getDirectoryLocations,
  getDirectoryTeams,
  listDirectoryFilterOptions,
  searchDirectoryPeople,
  type DirectorySort,
} from '../../server/services/directoryService.ts'
import { canRevealContacts, withPublicDb } from './_shared.ts'

const SORTS: DirectorySort[] = ['name', 'location', 'team', 'recent']

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET'])
  }

  const view = (event.queryStringParameters?.view ?? 'people').toLowerCase()
  const reveal = canRevealContacts(event)

  return withPublicDb(async (db) => {
    if (view === 'teams') {
      const teams = await getDirectoryTeams(db)
      return ok({ view: 'teams', teams })
    }

    if (view === 'locations') {
      const locations = await getDirectoryLocations(db)
      return ok({ view: 'locations', locations })
    }

    if (view === 'options') {
      const options = await listDirectoryFilterOptions(db)
      return ok({ view: 'options', ...options })
    }

    if (view !== 'people') {
      return fail('VALIDATION_ERROR', 'view must be people, teams, locations, or options.')
    }

    const q = event.queryStringParameters?.q ?? undefined
    const locationTypeParam = event.queryStringParameters?.locationType?.toUpperCase()
    const locationId = event.queryStringParameters?.location ?? undefined
    const teamSlug = event.queryStringParameters?.team ?? undefined
    const positionParam = event.queryStringParameters?.position?.toUpperCase()
    const statusParam = (event.queryStringParameters?.status ?? 'ACTIVE').toUpperCase()
    const sortParam = (event.queryStringParameters?.sort ?? 'name').toLowerCase()

    const locationType =
      locationTypeParam && (LOCATION_TYPES as readonly string[]).includes(locationTypeParam)
        ? (locationTypeParam as LocationType)
        : undefined
    const position =
      positionParam && (TEAM_POSITIONS as readonly string[]).includes(positionParam)
        ? (positionParam as TeamPosition)
        : undefined
    const status =
      statusParam === 'ALL'
        ? 'ALL'
        : (PERSON_STATUSES as readonly string[]).includes(statusParam)
          ? (statusParam as PersonStatus)
          : 'ACTIVE'
    const sort = (SORTS as readonly string[]).includes(sortParam)
      ? (sortParam as DirectorySort)
      : 'name'

    const result = await searchDirectoryPeople(
      db,
      {
        q,
        locationType,
        locationId,
        teamSlug,
        position,
        status,
        sort,
      },
      reveal,
    )

    return ok({
      view: 'people',
      total: result.total,
      people: result.people,
      contactRevealed: reveal,
    })
  })
}
