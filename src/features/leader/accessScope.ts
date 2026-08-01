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

export function teamBoardPath(teamSlug: string): string {
  if (teamSlug === 'graphic-design') return '/leader/teams/social-media/graphic-design'
  return `/leader/teams/${teamSlug}`
}

export function homePathForScope(scope: UnlockScope): string {
  if (scope.kind === 'category') return teamBoardPath(scope.teamSlug)
  if (scope.kind === 'segment') return `/leader/segments/${scope.segment}`
  return '/leader'
}
