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
  const env = import.meta.env.VITE_AYC_ENVIRONMENT ?? import.meta.env.MODE
  const showEnv = env !== 'production'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand" end>
            <span className="brand__mark">AYC</span>
            <span className="brand__text">
              <span className="brand__name">{AYC_SITE_NAME}</span>
              <span className="brand__beta">Leadership Beta</span>
            </span>
          </NavLink>
          {showEnv ? <span className="env-label">{env}</span> : null}
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>
          <nav
            id={menuId}
            className={`primary-nav ${menuOpen ? 'primary-nav--open' : ''}`}
            aria-label="Primary"
          >
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

      <main id="main-content" className="main">
        <Outlet />
      </main>

      <BetaFeedbackButton />

      <footer className="footer">
        <div className="footer__inner">
          <p>Arkansas Youth Coalition</p>
          <p>Leadership Workbench Beta</p>
          <p>Built with the leadership team</p>
          <nav className="footer__links" aria-label="Footer">
            <NavLink to="/feedback">Beta Feedback</NavLink>
            <NavLink to="/">Return Home</NavLink>
          </nav>
        </div>
      </footer>
    </div>
  )
}
