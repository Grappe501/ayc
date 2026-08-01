export type UnlockScope =
  | { kind: 'master'; label: string }
  | { kind: 'category'; teamSlug: string; label: string }
  | { kind: 'segment'; segment: 'high-school' | 'working-class'; label: string }

export {
  canAccessBoard,
  rolesFromUnlockScope,
  scopeCanAccessLocationCategoryBoard,
  scopeCanAccessLocationTeamBoard,
  scopeCanAccessSegmentBoard,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
  type BoardAccessTarget,
  type RoleGrant,
} from '@shared/access/canAccessBoard'

export function teamBoardPath(teamSlug: string): string {
  if (teamSlug === 'graphic-design') return '/leader/teams/social-media/graphic-design'
  return `/leader/teams/${teamSlug}`
}

export function locationTeamBoardPath(locationId: string): string {
  return `/leader/locations/${locationId}`
}

export function locationCategoryBoardPath(locationId: string, teamSlug: string): string {
  return `/leader/locations/${locationId}/teams/${teamSlug}`
}

export function homePathForScope(scope: UnlockScope): string {
  if (scope.kind === 'category') return teamBoardPath(scope.teamSlug)
  if (scope.kind === 'segment') return `/leader/segments/${scope.segment}`
  return '/leader'
}

export { homePathForRoles } from '@shared/access/homePathForRoles'
