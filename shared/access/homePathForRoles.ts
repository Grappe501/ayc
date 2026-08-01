import type { RoleGrant } from './canAccessBoard.ts'

function teamBoardPath(teamSlug: string): string {
  if (teamSlug === 'graphic-design') return '/leader/teams/social-media/graphic-design'
  return `/leader/teams/${teamSlug}`
}

/**
 * Role-aware home after login (V3 WS-A).
 * Highest responsibility wins: Lead Organizer → segment → category → location → directory.
 */
export function homePathForRoles(roles: RoleGrant[]): string {
  if (roles.some((r) => r.roleCode === 'LEAD_ORGANIZER')) return '/leader'

  if (roles.some((r) => r.roleCode === 'HS_LEAD_ORGANIZER')) {
    return '/leader/segments/high-school'
  }
  if (roles.some((r) => r.roleCode === 'WC_LEAD_ORGANIZER')) {
    return '/leader/segments/working-class'
  }

  const category = roles.find(
    (r) => r.roleCode === 'CATEGORY_LEAD' && r.teamSlug && r.teamSlug !== 'graphic-design',
  )
  if (category?.teamSlug) return teamBoardPath(category.teamSlug)

  if (roles.some((r) => r.roleCode === 'GRAPHIC_DESIGN_LEAD')) {
    return teamBoardPath('graphic-design')
  }

  const location = roles.find(
    (r) =>
      (r.roleCode === 'LOCATION_LEAD' || r.roleCode === 'LOCATION_TEAM_LEAD') && r.locationId,
  )
  if (location?.locationId) return `/leader/locations/${location.locationId}`

  return '/directory'
}
