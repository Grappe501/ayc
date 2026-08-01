import { TEAMS } from '@/content/ayc'

/** Five location category boards — Graphic Design stays statewide only. */
export const LOCATION_CATEGORY_TEAMS = TEAMS

export type LocationCategorySlug = (typeof LOCATION_CATEGORY_TEAMS)[number]['id']

export function isLocationCategorySlug(value: string | undefined): value is LocationCategorySlug {
  return Boolean(value && LOCATION_CATEGORY_TEAMS.some((team) => team.id === value))
}

export function locationTeamPath(locationId: string): string {
  return `/leader/locations/${locationId}`
}

export function locationCategoryPath(locationId: string, teamSlug: LocationCategorySlug): string {
  return `/leader/locations/${locationId}/teams/${teamSlug}`
}
