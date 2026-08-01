import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useId, useRef, useState } from 'react'
import { AYC_SITE_NAME } from '@/content/ayc'
import { BetaFeedbackButton } from '@/components/feedback/BetaFeedbackButton'
import { focusFirst, trapTabKey } from '@/components/ui/focusTrap'
import { useAuth } from '@/features/auth/AuthProvider'
import './AppShell.css'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/join', label: 'Join' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/directory', label: 'Directory' },
  { to: '/leader', label: 'Leaders' },
  { to: '/feedback', label: 'Feedback' },
] as const

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const { me, signOut } = useAuth()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const panel = panelRef.current
    if (panel) requestAnimationFrame(() => focusFirst(panel))

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMenuOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (panel) trapTabKey(e, panel)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand" end aria-label="AYC Leadership Workbench home">
            <span className="brand__mark" aria-hidden="true">
              AYC
            </span>
            <span className="brand__text">
              <span className="brand__org">Arkansas Youth Coalition</span>
              <span className="brand__product">
                {AYC_SITE_NAME}
                <span className="brand__beta">Leadership Beta</span>
              </span>
            </span>
          </NavLink>

          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <nav className="primary-nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  isActive ? 'primary-nav__link primary-nav__link--active' : 'primary-nav__link'
                }
              >
                {item.label}
              </NavLink>
            ))}
            {me ? (
              <>
                <NavLink
                  to={`/directory/${me.person.id}`}
                  className={({ isActive }) =>
                    isActive ? 'primary-nav__link primary-nav__link--active' : 'primary-nav__link'
                  }
                >
                  My profile
                </NavLink>
                <button
                  type="button"
                  className="primary-nav__link"
                  onClick={() => void signOut()}
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? 'primary-nav__link primary-nav__link--active' : 'primary-nav__link'
                }
              >
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <div
        id={menuId}
        className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}
        hidden={!menuOpen}
      >
        <div
          ref={panelRef}
          className="mobile-nav__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          tabIndex={-1}
        >
          <button
            type="button"
            className="mobile-nav__close"
            aria-label="Close menu"
            onClick={() => {
              setMenuOpen(false)
              toggleRef.current?.focus()
            }}
          >
            Close
          </button>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
          {me ? (
            <>
              <NavLink
                to={`/directory/${me.person.id}`}
                className={({ isActive }) =>
                  isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
                }
              >
                My profile
              </NavLink>
              <button
                type="button"
                className="mobile-nav__link"
                onClick={() => {
                  void signOut()
                  setMenuOpen(false)
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
              }
            >
              Log in
            </NavLink>
          )}
        </div>
      </div>

      <main id="main-content" className="main">
        <Outlet />
      </main>

      <BetaFeedbackButton />

      <footer className="footer">
        <div className="footer__inner">
          <p>Arkansas Youth Coalition</p>
          <p>Leadership Workbench</p>
          <p>Leadership Beta</p>
          <p className="footer__copy">© Arkansas Youth Coalition</p>
        </div>
      </footer>
    </div>
  )
}
