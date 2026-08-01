import { Badge, Card } from '@/components/ui'
import { TEAMS } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function TeamCards() {
  return (
    <section id="teams" className="landing__section ayc-reveal" aria-labelledby="teams-heading">
      <SectionHeading
        id="teams"
        eyebrow="Where you can serve"
        title="Five teams. One coalition."
        lede="Every member picks a home team. Graphic design hangs with Social Media as one statewide design group. You can volunteer now and grow into leading locally or statewide."
      />
      <div className="team-grid">
        {TEAMS.map((team) => (
          <Card key={team.id} interactive>
            <span className="team-card__mark" aria-hidden="true">
              {team.mark}
            </span>
            <Badge tone="blue">Team</Badge>
            <h3>{team.name}</h3>
            <span className="team-card__label">{team.shortLabel}</span>
            <p>{team.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
