import { Button, Card } from '@/components/ui'
import { SectionHeading } from './SectionChrome'

export function WorkbenchActionCards() {
  return (
    <section id="workbench" className="landing__section ayc-reveal" aria-labelledby="workbench-heading">
      <SectionHeading
        id="workbench"
        eyebrow="The Workbench"
        title="The Workbench"
        lede="The AYC Leadership Workbench will become the shared operating space for the people building the coalition."
      />
      <div className="workbench-grid">
        <Card interactive>
          <h3>Leader Board</h3>
          <p>
            Create and maintain the statewide contact network, assign teams and positions, and build
            the organizational foundation.
          </p>
          <Button to="/leader" variant="primary">
            Open Leader Board
          </Button>
          <p className="workbench-card__status">Contact management launches in Phase 1D.</p>
        </Card>
        <Card interactive>
          <h3>Leadership Directory</h3>
          <p>
            Find the people, teams, schools, colleges, and counties represented across the coalition.
          </p>
          <Button to="/directory" variant="secondary">
            View Directory
          </Button>
          <p className="workbench-card__status">Directory tools launch in Phase 1F.</p>
        </Card>
      </div>
    </section>
  )
}
