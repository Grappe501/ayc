import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LeaderAccessGate } from '@/features/leader/LeaderAccessGate'
import {
  getLeaderScope,
  hasLeaderSession,
  type UnlockScope,
} from '@/features/leader/leaderSession'
import {
  homePathForScope,
  scopeCanAccessLocationCategoryBoard,
  scopeCanAccessLocationTeamBoard,
  scopeCanAccessSegmentBoard,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
} from '@/features/leader/accessScope'

type Props = {
  children: ReactNode
  /** When set, require access to this team board slug. */
  teamSlug?: string
  /** When set, require access to this segment shell. */
  segment?: 'high-school' | 'working-class'
  /** Location TEAM board — pass location type (COLLEGE / HIGH_SCHOOL / COUNTY). */
  locationType?: string
  /** Location category board — requires teamSlug + locationType. */
  locationCategorySlug?: string
  /** Require statewide Leader Board (master or segment). */
  requireStatewide?: boolean
  /** Lead Organizer master key only. */
  requireMaster?: boolean
}

export function RequireLeaderAccess({
  children,
  teamSlug,
  segment,
  locationType,
  locationCategorySlug,
  requireStatewide,
  requireMaster,
}: Props) {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(() => hasLeaderSession())
  const [scope, setScope] = useState<UnlockScope | null>(() => getLeaderScope())

  if (!unlocked || !scope) {
    return (
      <LeaderAccessGate
        onUnlocked={(next) => {
          setScope(next)
          setUnlocked(true)
          // Category / GD / segment keys land on their home board; master stays on the requested page.
          if (next.kind !== 'master') {
            navigate(homePathForScope(next), { replace: true })
          }
        }}
      />
    )
  }

  if (requireMaster && scope.kind !== 'master') {
    return <Navigate to={homePathForScope(scope)} replace />
  }

  if (requireStatewide && !scopeCanAccessStatewideLeaderBoard(scope)) {
    return <Navigate to={homePathForScope(scope)} replace />
  }

  if (segment && !scopeCanAccessSegmentBoard(scope, segment)) {
    return <Navigate to={homePathForScope(scope)} replace />
  }

  if (locationCategorySlug && locationType) {
    if (!scopeCanAccessLocationCategoryBoard(scope, locationCategorySlug)) {
      return <Navigate to={homePathForScope(scope)} replace />
    }
  } else if (locationType && !scopeCanAccessLocationTeamBoard(scope, locationType)) {
    return <Navigate to={homePathForScope(scope)} replace />
  }

  if (teamSlug && !locationCategorySlug && !scopeCanAccessTeamBoard(scope, teamSlug)) {
    return <Navigate to={homePathForScope(scope)} replace />
  }

  return children
}
