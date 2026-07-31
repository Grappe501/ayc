import { AYC_MISSION, TEAMS } from '@/content/ayc'
import { Badge, Card, Hero, Section } from '@/components/ui'
import { Button } from '@/components/ui/Button'

function missionExcerpt(mission: string): string {
  const first = mission.split(/(?<=\.)\s+(?=[A-Z])/)[0]
  return first ?? mission
}

export function HomePage() {
  return (
    <div>
      <Hero
        title="Building the next generation of Arkansas leadership."
        mission={missionExcerpt(AYC_MISSION)}
        primaryTo="/leader"
        primaryLabel="Enter Leader Board"
        secondaryTo="/directory"
        secondaryLabel="Leadership Directory"
      />

      <Section
        id="mission"
        eyebrow="Our Mission"
        title="Why AYC exists"
        description="Canonical mission language — preserved exactly as approved by AYC leadership."
      >
        <Card>
          <p>{AYC_MISSION}</p>
        </Card>
      </Section>

      <Section
        id="vision"
        eyebrow="Vision"
        title="From listening to building"
        description="Young Arkansans want meaningful ways to participate. Leadership grows locally — then connects statewide."
      >
        <div className="card-grid card-grid--3">
          <Card interactive>
            <p className="card__eyebrow">Listen</p>
            <h3>Here’s What We Heard</h3>
            <p>Young Arkansans want meaningful ways to participate — not afterthoughts at the edge of politics.</p>
          </Card>
          <Card interactive>
            <p className="card__eyebrow">Build</p>
            <h3>What We Are Building</h3>
            <p>A statewide, youth-led network rooted in schools, colleges, and local communities.</p>
          </Card>
          <Card interactive>
            <p className="card__eyebrow">Grow</p>
            <h3>How We Get There</h3>
            <p>Organizing. Voter registration. Social media. Events. Outreach. Leadership multiplied statewide.</p>
          </Card>
        </div>
      </Section>

      <Section
        id="teams"
        eyebrow="Five Teams"
        title="The work of the coalition"
        description="Phase 1 introduces the teams. Operational boards arrive through beta."
      >
        <div className="card-grid card-grid--5">
          {TEAMS.map((team) => (
            <Card key={team.id} interactive>
              <Badge tone="blue">Phase 1 Team</Badge>
              <h3>{team.name}</h3>
              <p>
                <strong>{team.purpose}</strong>
              </p>
              <p>{team.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="build-with-us" eyebrow="Leadership Beta" title="Built with the leadership team">
        <Card className="glass">
          <p>
            This Workbench will grow with the coalition. AYC leaders will test each phase, identify what
            they need, and help decide what gets built next.
          </p>
          <Button to="/feedback" variant="primary">
            Share Beta Feedback
          </Button>
        </Card>
      </Section>

      <Section id="enter" eyebrow="Workbench" title="Enter the Workbench">
        <div className="card-grid card-grid--2">
          <Card interactive>
            <h3>Leader Board</h3>
            <p>Create and manage the statewide leadership contact list.</p>
            <Button to="/leader" variant="primary">
              Open Leader Board
            </Button>
          </Card>
          <Card interactive>
            <h3>Leadership Directory</h3>
            <p>Find the people, locations, teams, and leadership roles building AYC.</p>
            <Button to="/directory" variant="secondary">
              View Directory
            </Button>
          </Card>
        </div>
      </Section>
    </div>
  )
}
