import { Button } from '@/components/ui/Button'
import '@/components/ui/ui.css'

export function LeaderPage() {
  return (
    <div>
      <p className="page-eyebrow">Leader Board</p>
      <h1>Build and maintain the AYC leadership network.</h1>
      <p className="page-lede">
        Phase 1 contact entry is next. This board will unlock with the leader access code, then let
        you add people, locations, and team assignments.
      </p>
      <div className="surface empty-panel">
        <h2>Coming in the next build slices</h2>
        <p>
          Write-access gate, contact form, location codes, duplicate review, archive, and restore —
          following Volume VI Screen Bible.
        </p>
        <div className="btn-row">
          <Button to="/directory" variant="primary">
            View Directory
          </Button>
          <Button to="/feedback" variant="secondary">
            Send Beta Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}
