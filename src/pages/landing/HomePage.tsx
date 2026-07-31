import { AYC_MISSION, TEAMS } from '@/content/ayc'
import { Button } from '@/components/ui/Button'
import '@/components/ui/ui.css'

function missionParagraphs(mission: string): string[] {
  const parts = mission.split(/(?<=\.)\s+(?=[A-Z])/)
  return parts.length > 1 ? parts : [mission]
}

export function HomePage() {
  const paragraphs = missionParagraphs(AYC_MISSION)

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__network" aria-hidden="true" />
        <p className="page-eyebrow">Arkansas Youth Coalition</p>
        <h1 id="hero-heading">Arkansas belongs to the people who are ready to build its future.</h1>
        <p className="page-lede">
          A statewide network of young Arkansans organizing, leading, registering voters, creating
          community, and building lasting civic power.
        </p>
        <div className="btn-row">
          <Button to="/leader" variant="primary">
            Enter the Leader Board
          </Button>
          <Button to="/directory" variant="secondary">
            View the Leadership Directory
          </Button>
        </div>
      </section>

      <section className="section" aria-labelledby="mission-heading">
        <div className="surface">
          <p className="page-eyebrow">Our Mission</p>
          <h2 id="mission-heading">Why AYC exists</h2>
          <div className="mission-block">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="vision-heading">
        <h2 id="vision-heading">Vision</h2>
        <div className="card-grid card-grid--3">
          <article className="content-card surface">
            <h3>Here’s What We Heard</h3>
            <p>Young Arkansans want meaningful ways to participate — not afterthoughts at the edge of politics.</p>
          </article>
          <article className="content-card surface">
            <h3>What We Are Building</h3>
            <p>
              A statewide, youth-led network rooted in schools, colleges, and local communities —
              connected through one shared Workbench.
            </p>
          </article>
          <article className="content-card surface">
            <h3>How We Get There</h3>
            <p>
              Organizing. Voter registration. Social media. Events. Community outreach. Leadership
              developed locally and multiplied statewide.
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="teams-heading">
        <h2 id="teams-heading">Five Teams</h2>
        <p className="page-lede">Phase 1 introduces the teams that will later receive their own boards.</p>
        <div className="card-grid card-grid--5">
          {TEAMS.map((team) => (
            <article key={team.id} className="content-card surface">
              <p className="page-eyebrow">Phase 1 Team</p>
              <h3>{team.name}</h3>
              <p>
                <strong>{team.purpose}</strong>
              </p>
              <p>{team.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="build-heading">
        <div className="surface">
          <h2 id="build-heading">Built with the leadership team</h2>
          <p>
            This Workbench will grow with the coalition. AYC leaders will test each phase, identify
            what they need, and help decide what gets built next.
          </p>
          <Button to="/feedback" variant="primary">
            Share Beta Feedback
          </Button>
        </div>
      </section>

      <section className="section" aria-labelledby="enter-heading">
        <h2 id="enter-heading">Enter the Workbench</h2>
        <div className="card-grid card-grid--2">
          <article className="content-card surface">
            <h3>Leader Board</h3>
            <p>Create and manage the statewide leadership contact list.</p>
            <Button to="/leader" variant="primary">
              Open Leader Board
            </Button>
          </article>
          <article className="content-card surface">
            <h3>Leadership Directory</h3>
            <p>Find the people, locations, teams, and leadership roles building AYC.</p>
            <Button to="/directory" variant="secondary">
              View Directory
            </Button>
          </article>
        </div>
      </section>
    </div>
  )
}
