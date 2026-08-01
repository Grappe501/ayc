import { useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LeaderAccessGate } from '@/features/leader/LeaderAccessGate'
import {
  getLeaderScope,
  hasLeaderSession,
  type UnlockScope,
} from '@/features/leader/leaderSession'
import {
  homePathForScope,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
} from '@/features/leader/accessScope'

type Props = {
  children: ReactNode
  /** When set, require access to this team board slug. */
  teamSlug?: string
  /** Require statewide Leader Board (master or segment). */
  requireStatewide?: boolean
  /** Lead Organizer master key only. */
  requireMaster?: boolean
}

export function RequireLeaderAccess({
  children,
  teamSlug,
  requireStatewide,
  requireMaster,
}: Props) {
  const [unlocked, setUnlocked] = useState(() => hasLeaderSession())
  const [scope, setScope] = useState<UnlockScope | null>(() => getLeaderScope())

  if (!unlocked || !scope) {
    return (
      <LeaderAccessGate
        onUnlocked={(next) => {
          setScope(next)
          setUnlocked(true)
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

  if (teamSlug && !scopeCanAccessTeamBoard(scope, teamSlug)) {
    return <Navigate to={homePathForScope(scope)} replace />
  }

  return children
}
