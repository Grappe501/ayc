import { Card } from '@/components/ui'
import { COMING_NEXT, WHY_JOIN, WHY_LEAD, WHY_VOLUNTEER } from '@/content/landing'
import { SectionHeading } from './SectionChrome'

export function WhySections() {
  return (
    <>
      <section id="why" className="landing__section ayc-reveal" aria-labelledby="why-heading">
        <SectionHeading
          id="why"
          eyebrow="Why join"
          title="Why join AYC now."
          lede="Young people in Arkansas already care. AYC gives that care a place to become skill, relationship, and power."
        />
        <div className="insight-grid">
          {WHY_JOIN.map((item) => (
            <Card key={item.title} interactive>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="volunteer"
        className="landing__section ayc-reveal"
        aria-labelledby="volunteer-heading"
      >
        <SectionHeading
          id="volunteer"
          eyebrow="Why volunteer"
          title="Why volunteer with us."
          lede="You do not have to be a lead to matter. Volunteers make the coalition real — and grow into leaders over time."
        />
        <div className="pillar-grid">
          {WHY_VOLUNTEER.map((item) => (
            <Card key={item.title} interactive>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="lead" className="landing__section ayc-reveal" aria-labelledby="lead-heading">
        <SectionHeading
          id="lead"
          eyebrow="Why lead"
          title="Why step into leadership."
          lede="If you want to organize your campus, school, or county — or grow toward statewide category leadership — we need you."
        />
        <div className="pillar-grid">
          {WHY_LEAD.map((item) => (
            <Card key={item.title} interactive>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="building"
        className="landing__section ayc-reveal"
        aria-labelledby="building-heading"
      >
        <SectionHeading
          id="building"
          eyebrow="As we build"
          title="More is coming — get in on the start."
          lede="We are launching with real people already in motion. Early members help shape what AYC becomes next."
        />
        <ul className="coming-list">
          {COMING_NEXT.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
