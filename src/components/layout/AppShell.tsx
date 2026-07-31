import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useId, useState } from 'react'
import { AYC_SITE_NAME } from '@/content/ayc'
import { BetaFeedbackButton } from '@/components/feedback/BetaFeedbackButton'
import './AppShell.css'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/directory', label: 'Directory' },
  { to: '/leader', label: 'Leader Board' },
  { to: '/feedback', label: 'Feedback' },
] as const

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuId = useId()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
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
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            ☰
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
          </nav>
        </div>
      </header>

      <div
        id={menuId}
        className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}
        hidden={!menuOpen}
      >
        <div className="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="mobile-nav__close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
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
