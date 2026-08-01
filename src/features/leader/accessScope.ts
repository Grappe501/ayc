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

export function homePathForScope(scope: UnlockScope): string {
  if (scope.kind === 'category') return `/leader/teams/${scope.teamSlug}`
  // Segment boards (HS / WC) ship in Phase 2F — statewide Leader Board is the home until then.
  return '/leader'
}
