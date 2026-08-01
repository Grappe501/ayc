import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { fetchMe, type AuthMe } from './authApi'
import { getSupabaseBrowserClient, isBrowserAuthConfigured } from './supabaseClient'
import { signOut as sessionSignOut } from './authSession'

type AuthState = {
  ready: boolean
  configured: boolean
  session: Session | null
  me: AuthMe | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isBrowserAuthConfigured()
  const [ready, setReady] = useState(!configured)
  const [session, setSession] = useState<Session | null>(null)
  const [me, setMe] = useState<AuthMe | null>(null)

  async function loadMe() {
    const result = await fetchMe()
    if (result.ok) setMe(result.data)
    else setMe(null)
  }

  async function refresh() {
    const client = getSupabaseBrowserClient()
    if (!client) {
      setSession(null)
      setMe(null)
      setReady(true)
      return
    }
    const { data } = await client.auth.getSession()
    setSession(data.session)
    if (data.session) await loadMe()
    else setMe(null)
    setReady(true)
  }

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) {
      setReady(true)
      return
    }
    const { data: sub } = client.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (next) void loadMe()
      else setMe(null)
      // INITIAL_SESSION covers recovery hash/code exchange from /reset-password.
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'PASSWORD_RECOVERY' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        setReady(true)
      }
    })
    void refresh()
    return () => sub.subscription.unsubscribe()
    // Mount-only: subscribe once; refresh/loadMe close over fresh setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signOut() {
    await sessionSignOut()
    setSession(null)
    setMe(null)
  }

  return (
    <AuthContext.Provider
      value={{ ready, configured, session, me, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
