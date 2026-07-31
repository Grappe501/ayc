import { Button } from '@/components/ui/Button'
import '@/components/ui/ui.css'

export function NotFoundPage() {
  return (
    <div>
      <p className="page-eyebrow">Not available</p>
      <h1>This Page Is Not Available</h1>
      <p className="page-lede">
        The link may be outdated, or the page may not be part of the current beta.
      </p>
      <div className="btn-row">
        <Button to="/" variant="primary">
          Return Home
        </Button>
        <Button to="/directory" variant="secondary">
          Open Directory
        </Button>
      </div>
    </div>
  )
}
