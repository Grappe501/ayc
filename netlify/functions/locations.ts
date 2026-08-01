import type { Handler } from '@netlify/functions'
import type { LocationType } from '../../server/domain/enums.ts'
import { LOCATION_TYPES } from '../../server/domain/enums.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  createLocationRecord,
  getLocationById,
  listLocations,
} from '../../server/services/locationService.ts'
import { ensureLocationBoards } from '../../server/services/ensureLocationBoards.ts'
import { withLeaderDb } from './_shared.ts'

type CreateBody = {
  locationType?: LocationType
  name?: string
  code?: string
  shortName?: string | null
  city?: string | null
  countyName?: string | null
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return withLeaderDb(event, async (db) => {
      const idParam = event.queryStringParameters?.id?.trim()
      if (idParam) {
        const row = await getLocationById(db, idParam)
        if (!row) return fail('NOT_FOUND', 'Location not found.', 404)
        // Ensure boards exist for older locations created before Phase 2E.
        try {
          await ensureLocationBoards(db, row.id)
        } catch (error) {
          console.error('ensureLocationBoards on location fetch', error)
        }
        return ok({
          id: row.id,
          locationType: row.locationType,
          code: row.code,
          compositeCode: row.compositeCode,
          name: row.name,
          shortName: row.shortName,
          city: row.city,
          countyName: row.countyName,
        })
      }

      const typeParam = event.queryStringParameters?.type
      const locationType =
        typeParam && (LOCATION_TYPES as readonly string[]).includes(typeParam)
          ? (typeParam as LocationType)
          : undefined
      const rows = await listLocations(db, locationType)
      return ok(
        rows.map((row) => ({
          id: row.id,
          locationType: row.locationType,
          code: row.code,
          compositeCode: row.compositeCode,
          name: row.name,
          shortName: row.shortName,
          city: row.city,
          countyName: row.countyName,
        })),
      )
    })
  }

  if (event.httpMethod === 'POST') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<CreateBody>(event.body)
      if (!body?.locationType || !body.name || !body.code) {
        return fail('VALIDATION_ERROR', 'Location type, name, and code are required.')
      }
      try {
        const location = await createLocationRecord(db, {
          locationType: body.locationType,
          name: body.name,
          code: body.code,
          shortName: body.shortName,
          city: body.city,
          countyName: body.countyName,
          actor: 'SHARED_LEADER_SESSION',
        })
        return ok(
          {
            id: location.id,
            locationType: location.locationType,
            code: location.code,
            compositeCode: location.compositeCode,
            name: location.name,
            shortName: location.shortName,
          },
          201,
        )
      } catch (error) {
        const err = error as { code?: string; message?: string; fields?: Record<string, string> }
        if (err.code === 'LOCATION_CODE_CONFLICT') {
          return fail(
            'LOCATION_CODE_CONFLICT',
            err.message ?? 'That location code is already in use.',
            409,
          )
        }
        if (err.code === 'VALIDATION_ERROR') {
          return fail(
            'VALIDATION_ERROR',
            'Please review the highlighted fields.',
            400,
            err.fields,
          )
        }
        throw error
      }
    })
  }

  return methodNotAllowed(['GET', 'POST'])
}
