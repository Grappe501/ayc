/**
 * Phase 2G — single product-law access engine.
 * Keys and person roles both resolve to RoleGrant[], then call canAccessBoard.
 */

export type RoleGrant = {
  roleCode: string
  teamSlug?: string | null
  teamId?: string | null
  locationId?: string | null
  segment?: string | null
}

export type BoardAccessTarget =
  | { kind: 'MAIN' }
  | { kind: 'STATEWIDE_CATEGORY'; teamSlug: string }
  | { kind: 'SECONDARY'; teamSlug: 'graphic-design'; parentTeamSlug?: 'social-media' }
  | { kind: 'SEGMENT'; segment: 'HIGH_SCHOOL' | 'WORKING_CLASS' }
  | {
      kind: 'LOCATION_TEAM'
      locationId: string
      locationType: 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY' | string
    }
  | {
      kind: 'LOCATION_CATEGORY'
      locationId: string
      teamSlug: string
      locationType?: string
    }

function hasLeadOrganizer(roles: RoleGrant[]): boolean {
  return roles.some((role) => role.roleCode === 'LEAD_ORGANIZER')
}

function categoryLeadFor(roles: RoleGrant[], teamSlug: string): boolean {
  return roles.some(
    (role) => role.roleCode === 'CATEGORY_LEAD' && role.teamSlug === teamSlug,
  )
}

function socialMediaLead(roles: RoleGrant[]): boolean {
  return categoryLeadFor(roles, 'social-media')
}

function graphicDesignLead(roles: RoleGrant[]): boolean {
  return roles.some((role) => role.roleCode === 'GRAPHIC_DESIGN_LEAD')
}

function hsLead(roles: RoleGrant[]): boolean {
  return roles.some((role) => role.roleCode === 'HS_LEAD_ORGANIZER')
}

function wcLead(roles: RoleGrant[]): boolean {
  return roles.some((role) => role.roleCode === 'WC_LEAD_ORGANIZER')
}

function locationLeadFor(roles: RoleGrant[], locationId: string): boolean {
  return roles.some(
    (role) => role.roleCode === 'LOCATION_LEAD' && role.locationId === locationId,
  )
}

function anyCategoryLead(roles: RoleGrant[]): boolean {
  return roles.some(
    (role) => role.roleCode === 'CATEGORY_LEAD' && role.teamSlug !== 'graphic-design',
  )
}

/**
 * Product law (§2.2): can this principal open this board?
 */
export function canAccessBoard(roles: RoleGrant[], board: BoardAccessTarget): boolean {
  if (roles.length === 0) return false
  if (hasLeadOrganizer(roles)) return true

  switch (board.kind) {
    case 'MAIN':
      // Statewide Leader Board — Lead Organizer or segment organizers (rollup entry).
      return hsLead(roles) || wcLead(roles)

    case 'STATEWIDE_CATEGORY':
      return categoryLeadFor(roles, board.teamSlug)

    case 'SECONDARY':
      if (board.teamSlug === 'graphic-design') {
        return graphicDesignLead(roles) || socialMediaLead(roles)
      }
      return false

    case 'SEGMENT':
      if (board.segment === 'HIGH_SCHOOL') return hsLead(roles)
      if (board.segment === 'WORKING_CLASS') return wcLead(roles)
      return false

    case 'LOCATION_TEAM':
      if (locationLeadFor(roles, board.locationId)) return true
      if (anyCategoryLead(roles)) return true
      if (board.locationType === 'HIGH_SCHOOL' && hsLead(roles)) return true
      if (board.locationType === 'COUNTY' && wcLead(roles)) return true
      return false

    case 'LOCATION_CATEGORY':
      // Segment organizers do not own category boards; GD lead does not.
      return categoryLeadFor(roles, board.teamSlug)

    default:
      return false
  }
}

export type UnlockScopeLike =
  | { kind: 'master'; label?: string }
  | { kind: 'category'; teamSlug: string; label?: string }
  | { kind: 'segment'; segment: 'high-school' | 'working-class'; label?: string }

/** Map key unlock scope to synthetic role grants (same law as person roles). */
export function rolesFromUnlockScope(scope: UnlockScopeLike): RoleGrant[] {
  if (scope.kind === 'master') {
    return [{ roleCode: 'LEAD_ORGANIZER', segment: 'ALL' }]
  }
  if (scope.kind === 'category') {
    if (scope.teamSlug === 'graphic-design') {
      return [{ roleCode: 'GRAPHIC_DESIGN_LEAD', teamSlug: 'graphic-design' }]
    }
    return [{ roleCode: 'CATEGORY_LEAD', teamSlug: scope.teamSlug }]
  }
  if (scope.segment === 'high-school') {
    return [{ roleCode: 'HS_LEAD_ORGANIZER', segment: 'HIGH_SCHOOL' }]
  }
  return [{ roleCode: 'WC_LEAD_ORGANIZER', segment: 'WORKING_CLASS' }]
}

export function scopeCanAccessTeamBoard(
  scope: UnlockScopeLike,
  teamSlug: string,
): boolean {
  const roles = rolesFromUnlockScope(scope)
  if (teamSlug === 'graphic-design') {
    return canAccessBoard(roles, {
      kind: 'SECONDARY',
      teamSlug: 'graphic-design',
      parentTeamSlug: 'social-media',
    })
  }
  return canAccessBoard(roles, { kind: 'STATEWIDE_CATEGORY', teamSlug })
}

export function scopeCanAccessStatewideLeaderBoard(scope: UnlockScopeLike): boolean {
  return canAccessBoard(rolesFromUnlockScope(scope), { kind: 'MAIN' })
}

export function scopeCanAccessSegmentBoard(
  scope: UnlockScopeLike,
  segment: 'high-school' | 'working-class',
): boolean {
  return canAccessBoard(rolesFromUnlockScope(scope), {
    kind: 'SEGMENT',
    segment: segment === 'high-school' ? 'HIGH_SCHOOL' : 'WORKING_CLASS',
  })
}

export function scopeCanAccessLocationTeamBoard(
  scope: UnlockScopeLike,
  locationType: string,
  locationId = 'unknown',
): boolean {
  return canAccessBoard(rolesFromUnlockScope(scope), {
    kind: 'LOCATION_TEAM',
    locationId,
    locationType,
  })
}

export function scopeCanAccessLocationCategoryBoard(
  scope: UnlockScopeLike,
  teamSlug: string,
  locationId = 'unknown',
): boolean {
  return canAccessBoard(rolesFromUnlockScope(scope), {
    kind: 'LOCATION_CATEGORY',
    locationId,
    teamSlug,
  })
}
