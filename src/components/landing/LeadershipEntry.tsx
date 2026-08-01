import { Button, Card } from '@/components/ui'
import { SectionHeading } from './SectionChrome'

/** De-emphasized leadership tooling — bottom of public landing. */
export function LeadershipEntry() {
  return (
    <section
      id="leadership-tools"
      className="landing__section leadership-entry ayc-reveal"
      aria-labelledby="leadership-tools-heading"
    >
      <SectionHeading
        id="leadership-tools"
        eyebrow="For current leaders"
        title="Leadership Workbench"
        lede="Already on the leadership team? Unlock your board with your access key. Visitors exploring AYC can stay on Join and the Directory."
      />
      <div className="workbench-grid">
        <Card>
          <h3>Leader Board</h3>
          <p>
            Statewide contacts, gap fill, and assignments for the Lead Organizer and segment lead
            organizers.
          </p>
          <Button to="/leader" variant="secondary">
            Enter Leader Board
          </Button>
        </Card>
        <Card>
          <h3>Team boards</h3>
          <p>
            Category Campaign Leads unlock their hierarchy — Organizer, Voter Registration, Social
            Media, Events, or Outreach.
          </p>
          <Button to="/leader/teams/organizer" variant="secondary">
            Open a team board
          </Button>
        </Card>
        <Card>
          <h3>Directory</h3>
          <p>Browse people, teams, colleges, high schools, and counties already represented.</p>
          <Button to="/directory" variant="secondary">
            View Directory
          </Button>
        </Card>
      </div>
      <p className="leadership-entry__note">
        Feedback for the beta:{' '}
        <a href="/feedback">Share beta feedback</a>
      </p>
    </section>
  )
}
