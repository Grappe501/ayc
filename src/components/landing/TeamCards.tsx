import { Badge, Card } from '@/components/ui'
import { TEAMS } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function TeamCards() {
  return (
    <section id="teams" className="landing__section ayc-reveal" aria-labelledby="teams-heading">
      <SectionHeading
        id="teams"
        eyebrow="The Teams"
        title="Five Teams. One Coalition."
        lede="AYC begins with five practical teams that give every leader and volunteer a clear way to contribute."
      />
      <div className="team-grid">
        {TEAMS.map((team) => (
          <Card key={team.id} interactive>
            <span className="team-card__mark" aria-hidden="true">
              {team.mark}
            </span>
            <Badge tone="blue">Founding Team</Badge>
            <h3>{team.name}</h3>
            <span className="team-card__label">{team.shortLabel}</span>
            <p>{team.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
