import type { AycDatabase } from '../db/client.ts'
import type { LocationType } from '../domain/enums.ts'
import { isValidLocationCode, toCompositeCode } from '../domain/locationCodes.ts'
import { normalizeLocationName } from '../domain/normalize.ts'
import {
  createLocation,
  findLocationById,
  findLocationByTypeAndCode,
  listActiveLocations,
} from '../repos/locations.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import { ensureLocationBoards } from './ensureLocationBoards.ts'

export type CreateLocationRequest = {
  locationType: LocationType
  name: string
  code: string
  shortName?: string | null
  city?: string | null
  countyName?: string | null
  actor?: string | null
}

export async function listLocations(db: AycDatabase, locationType?: LocationType) {
  return listActiveLocations(db, locationType)
}

export async function getLocationById(db: AycDatabase, locationId: string) {
  return findLocationById(db, locationId)
}

export async function createLocationRecord(db: AycDatabase, input: CreateLocationRequest) {
  const name = input.name.trim()
  const code = input.code.trim().toUpperCase()

  if (!name) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { name: 'Official location name is required.' },
    })
  }
  if (!isValidLocationCode(code)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { code: 'Location code must be exactly three uppercase letters.' },
    })
  }

  const existing = await findLocationByTypeAndCode(db, input.locationType, code)
  if (existing) {
    throw Object.assign(new Error('LOCATION_CODE_CONFLICT'), {
      code: 'LOCATION_CODE_CONFLICT' as const,
      message: `${code} is already used by another ${input.locationType.replaceAll('_', ' ').toLowerCase()}.`,
    })
  }

  const location = await createLocation(db, {
    locationType: input.locationType,
    name,
    code,
    shortName: input.shortName,
    city: input.city,
    countyName: input.countyName,
    actor: input.actor,
  })

  await insertAuditEvent(db, {
    eventType: 'LOCATION_CREATED',
    entityType: 'LOCATION',
    entityId: location.id,
    actorType: 'SHARED_LEADER_SESSION',
    actorLabel: input.actor ?? 'SHARED_LEADER_SESSION',
    changeSummary: `Created location ${name} (${toCompositeCode(input.locationType, code)}).`,
    metadata: {
      locationType: input.locationType,
      code,
      normalizedName: normalizeLocationName(name),
    },
  })

  try {
    await ensureLocationBoards(db, location.id)
  } catch (error) {
    console.error('ensureLocationBoards failed after location create', error)
  }

  return location
}
