import { useState, type ReactNode } from 'react'
import { LeaderAccessGate } from '@/features/leader/LeaderAccessGate'
import { hasLeaderSession } from '@/features/leader/leaderSession'

export function RequireLeaderAccess({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => hasLeaderSession())

  if (!unlocked) {
    return <LeaderAccessGate onUnlocked={() => setUnlocked(true)} />
  }

  return children
}
