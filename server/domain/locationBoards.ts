import { STATEWIDE_CATEGORY_SLUGS, type LocationType } from './enums.ts'

export const LOCATION_CATEGORY_SLUGS = STATEWIDE_CATEGORY_SLUGS

export type LocationCategorySlug = (typeof LOCATION_CATEGORY_SLUGS)[number]

export function isLocationCategorySlug(value: string | undefined): value is LocationCategorySlug {
  return Boolean(
    value && (LOCATION_CATEGORY_SLUGS as readonly string[]).includes(value),
  )
}

/** Board slug for a location TEAM board — globally unique. */
export function locationTeamBoardSlug(compositeCode: string): string {
  return `loc-${compositeCode.trim().toUpperCase()}`
}

/** Board slug for a location category board. */
export function locationCategoryBoardSlug(
  compositeCode: string,
  teamSlug: LocationCategorySlug,
): string {
  return `loc-${compositeCode.trim().toUpperCase()}-${teamSlug}`
}

export function locationTeamBoardPath(locationId: string): string {
  return `/leader/locations/${locationId}`
}

export function locationCategoryBoardPath(
  locationId: string,
  teamSlug: LocationCategorySlug,
): string {
  return `/leader/locations/${locationId}/teams/${teamSlug}`
}

/** Parent board slug for a location TEAM board in the registry. */
export function parentBoardSlugForLocationType(locationType: LocationType): string {
  if (locationType === 'HIGH_SCHOOL') return 'high-school'
  if (locationType === 'COUNTY') return 'working-class'
  return 'main'
}

export function segmentForLocationType(
  locationType: LocationType,
): 'HIGH_SCHOOL' | 'WORKING_CLASS' | 'COLLEGE' {
  if (locationType === 'HIGH_SCHOOL') return 'HIGH_SCHOOL'
  if (locationType === 'COUNTY') return 'WORKING_CLASS'
  return 'COLLEGE'
}
