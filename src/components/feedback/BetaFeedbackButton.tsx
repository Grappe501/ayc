import { Link, useLocation } from 'react-router-dom'
import './BetaFeedbackButton.css'

export function BetaFeedbackButton() {
  const location = useLocation()
  if (location.pathname === '/feedback') return null

  const to = `/feedback?from=${encodeURIComponent(location.pathname + location.search)}`

  return (
    <Link to={to} className="beta-fab">
      Send Beta Feedback
    </Link>
  )
}
