export type UnlockScope =
  | { kind: 'master'; label: string }
  | { kind: 'category'; teamSlug: string; label: string }
  | { kind: 'segment'; segment: 'high-school' | 'working-class'; label: string }

export function scopeCanAccessTeamBoard(scope: UnlockScope, teamSlug: string): boolean {
  if (scope.kind === 'master') return true
  if (scope.kind === 'segment') return false
  if (scope.teamSlug === teamSlug) return true
  if (scope.teamSlug === 'social-media' && teamSlug === 'graphic-design') return true
  return false
}

export function scopeCanAccessStatewideLeaderBoard(scope: UnlockScope): boolean {
  return scope.kind === 'master' || scope.kind === 'segment'
}

export function scopeCanAccessSegmentBoard(
  scope: UnlockScope,
  segment: 'high-school' | 'working-class',
): boolean {
  if (scope.kind === 'master') return true
  return scope.kind === 'segment' && scope.segment === segment
}

/** Location TEAM board — master, category leads (not GD), matching segment. */
export function scopeCanAccessLocationTeamBoard(
  scope: UnlockScope,
  locationType: string,
): boolean {
  if (scope.kind === 'master') return true
  if (scope.kind === 'category') {
    return scope.teamSlug !== 'graphic-design'
  }
  if (scope.kind === 'segment') {
    if (scope.segment === 'high-school') return locationType === 'HIGH_SCHOOL'
    if (scope.segment === 'working-class') return locationType === 'COUNTY'
  }
  return false
}

/** Location category board — master or matching category key (not GD / not segment). */
export function scopeCanAccessLocationCategoryBoard(
  scope: UnlockScope,
  teamSlug: string,
): boolean {
  if (scope.kind === 'master') return true
  if (scope.kind === 'segment') return false
  if (scope.kind === 'category') {
    if (scope.teamSlug === 'graphic-design') return false
    return scope.teamSlug === teamSlug
  }
  return false
}

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
