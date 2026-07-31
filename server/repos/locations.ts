import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { locations } from '../db/schema.ts'
import type { LocationType } from '../domain/enums.ts'
import { normalizeLocationName } from '../domain/normalize.ts'
import { toCompositeCode } from '../domain/locationCodes.ts'

export type CreateLocationInput = {
  locationType: LocationType
  name: string
  code: string
  shortName?: string | null
  city?: string | null
  countyName?: string | null
  state?: string
  actor?: string | null
}

export async function findLocationByCompositeCode(db: AycDatabase, compositeCode: string) {
  const rows = await db
    .select()
    .from(locations)
    .where(eq(locations.compositeCode, compositeCode.toUpperCase()))
    .limit(1)
  return rows[0] ?? null
}

export async function findLocationByTypeAndCode(
  db: AycDatabase,
  locationType: LocationType,
  code: string,
) {
  const rows = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.locationType, locationType),
        eq(locations.code, code.toUpperCase()),
        isNull(locations.archivedAt),
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

export async function createLocation(db: AycDatabase, input: CreateLocationInput) {
  const code = input.code.toUpperCase()
  const compositeCode = toCompositeCode(input.locationType, code)
  const [row] = await db
    .insert(locations)
    .values({
      locationType: input.locationType,
      code,
      compositeCode,
      name: input.name.trim(),
      normalizedName: normalizeLocationName(input.name),
      shortName: input.shortName?.trim() || null,
      city: input.city?.trim() || null,
      countyName: input.countyName?.trim() || null,
      state: input.state ?? 'AR',
      active: true,
      createdByActor: input.actor ?? null,
      updatedByActor: input.actor ?? null,
    })
    .returning()
  return row
}

export async function listActiveLocations(db: AycDatabase, locationType?: LocationType) {
  if (locationType) {
    return db
      .select()
      .from(locations)
      .where(and(eq(locations.active, true), eq(locations.locationType, locationType)))
  }
  return db.select().from(locations).where(eq(locations.active, true))
}
