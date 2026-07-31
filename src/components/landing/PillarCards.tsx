import { Card } from '@/components/ui'
import { BUILDING_PILLARS } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function PillarCards() {
  return (
    <section id="building" className="landing__section ayc-reveal" aria-labelledby="building-heading">
      <SectionHeading
        id="building"
        eyebrow="The Vision"
        title="What We Are Building"
        lede="A statewide youth coalition that connects political education, relationships, public action, and leadership development."
      />
      <div className="pillar-grid">
        {BUILDING_PILLARS.map((pillar) => (
          <Card key={pillar.title}>
            <span className="pillar-card__number" aria-hidden="true">
              {pillar.number}
            </span>
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
