import { Link, useLocation } from 'react-router-dom'
import './BetaFeedbackButton.css'

export function BetaFeedbackButton() {
  const location = useLocation()
  const to = `/feedback?from=${encodeURIComponent(location.pathname)}`

  return (
    <Link to={to} className="beta-fab">
      Send Beta Feedback
    </Link>
  )
}
