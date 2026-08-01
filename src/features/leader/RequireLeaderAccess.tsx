import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, LoadingState } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { LeaderAccessGate } from '@/features/leader/LeaderAccessGate'
import {
  canAccessBoard,
  homePathForRoles,
  homePathForScope,
  scopeCanAccessLocationCategoryBoard,
  scopeCanAccessLocationTeamBoard,
  scopeCanAccessSegmentBoard,
  scopeCanAccessStatewideLeaderBoard,
  scopeCanAccessTeamBoard,
  type BoardAccessTarget,
  type RoleGrant,
} from '@/features/leader/accessScope'
import {
  getLeaderScope,
  hasLeaderSession,
  type UnlockScope,
} from '@/features/leader/leaderSession'

type Props = {
  children: ReactNode
  /** When set, require access to this team board slug. */
  teamSlug?: string
  /** When set, require access to this segment shell. */
  segment?: 'high-school' | 'working-class'
  /** Location TEAM board — pass location type (COLLEGE / HIGH_SCHOOL / COUNTY). */
  locationType?: string
  /** Optional concrete location for LOCATION_LEAD grants. */
  locationId?: string
  /** Location category board — requires teamSlug + locationType. */
  locationCategorySlug?: string
  /** Require statewide Leader Board (master or segment). */
  requireStatewide?: boolean
  /** Lead Organizer master key / LEAD_ORGANIZER role only. */
  requireMaster?: boolean
}

function targetFromProps(props: Props): BoardAccessTarget {
  if (props.requireMaster || props.requireStatewide) return { kind: 'MAIN' }
  if (props.segment) {
    return {
      kind: 'SEGMENT',
      segment: props.segment === 'high-school' ? 'HIGH_SCHOOL' : 'WORKING_CLASS',
    }
  }
  if (props.locationCategorySlug) {
    return {
      kind: 'LOCATION_CATEGORY',
      locationId: props.locationId ?? 'unknown',
      teamSlug: props.locationCategorySlug,
      locationType: props.locationType,
    }
  }
  if (props.locationType) {
    return {
      kind: 'LOCATION_TEAM',
      locationId: props.locationId ?? 'unknown',
      locationType: props.locationType,
    }
  }
  if (props.teamSlug === 'graphic-design') {
    return {
      kind: 'SECONDARY',
      teamSlug: 'graphic-design',
      parentTeamSlug: 'social-media',
    }
  }
  if (props.teamSlug) {
    return { kind: 'STATEWIDE_CATEGORY', teamSlug: props.teamSlug }
  }
  return { kind: 'MAIN' }
}

function rolesAllow(props: Props, roles: RoleGrant[]): boolean {
  if (roles.length === 0) return false
  if (props.requireMaster) {
    return roles.some((role) => role.roleCode === 'LEAD_ORGANIZER')
  }
  return canAccessBoard(roles, targetFromProps(props))
}

function scopeAllows(props: Props, scope: UnlockScope): boolean {
  if (props.requireMaster && scope.kind !== 'master') return false
  if (props.requireStatewide && !scopeCanAccessStatewideLeaderBoard(scope)) return false
  if (props.segment && !scopeCanAccessSegmentBoard(scope, props.segment)) return false
  if (props.locationCategorySlug && props.locationType) {
    if (!scopeCanAccessLocationCategoryBoard(scope, props.locationCategorySlug)) return false
  } else if (props.locationType && !scopeCanAccessLocationTeamBoard(scope, props.locationType)) {
    return false
  }
  if (
    props.teamSlug &&
    !props.locationCategorySlug &&
    !scopeCanAccessTeamBoard(scope, props.teamSlug)
  ) {
    return false
  }
  return true
}

export function RequireLeaderAccess(props: Props) {
  const { children } = props
  const navigate = useNavigate()
  const { ready, me, session } = useAuth()
  const [unlocked, setUnlocked] = useState(() => hasLeaderSession())
  const [scope, setScope] = useState<UnlockScope | null>(() => getLeaderScope())

  if (!ready) return <LoadingState label="Checking access…" />

  const roleGrants = (me?.roles ?? []) as RoleGrant[]
  const accountOk = Boolean(session && me?.canAccessWorkbench && rolesAllow(props, roleGrants))
  const keyOk = Boolean(unlocked && scope && scopeAllows(props, scope))

  if (accountOk || keyOk) {
    return children
  }

  // Logged in with roles but not for this board
  if (session && me?.canAccessWorkbench && !rolesAllow(props, roleGrants) && !keyOk) {
    const home = me.homePath || homePathForRoles(roleGrants)
    return <Navigate to={home} replace />
  }

  // Logged in without leadership roles — explain, offer break-glass
  if (session && me && !me.canAccessWorkbench && !keyOk) {
    return (
      <div>
        <p className="page-header__eyebrow">Workbench</p>
        <h1>No board access on this account</h1>
        <p className="page-header__lede">
          You’re signed in as {me.person.displayName}, but this account doesn’t have a leadership
          role yet. Ask the Lead Organizer for a role grant, or use the emergency board key below.
        </p>
        <div className="btn-row" style={{ marginBottom: '1.5rem' }}>
          <Button to={`/directory/${me.person.id}`} variant="secondary">
            My profile
          </Button>
          <Button to="/" variant="secondary">
            Home
          </Button>
        </div>
        <LeaderAccessGate
          breakGlass
          onUnlocked={(next) => {
            setScope(next)
            setUnlocked(true)
            if (next.kind !== 'master') {
              navigate(homePathForScope(next), { replace: true })
            }
          }}
        />
      </div>
    )
  }

  // Not logged in — board key first (bootstrap); account login when invited
  return (
    <div>
      <p className="page-header__eyebrow">Leadership Workbench</p>
      <h1>Unlock the workbench</h1>
      <p className="page-header__lede">
        Enter your leadership board key to open boards. Personal login is for people who already
        claimed an invite — invites are created from a contact after you’re unlocked.
      </p>
      <LeaderAccessGate
        onUnlocked={(next) => {
          setScope(next)
          setUnlocked(true)
          if (next.kind !== 'master') {
            navigate(homePathForScope(next), { replace: true })
          }
        }}
      />
      <p className="field__hint" style={{ marginTop: '1.25rem' }}>
        Already claimed an invite?{' '}
        <Button to={`/login?next=${encodeURIComponent(window.location.pathname)}`} variant="secondary">
          Log in with account
        </Button>
      </p>
    </div>
  )
}
