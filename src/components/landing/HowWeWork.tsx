import { HOW_WE_WORK } from '@/content/landing'
import { SectionHeading } from './SectionChrome'

export function HowWeWork() {
  return (
    <section id="how" className="landing__section ayc-reveal" aria-labelledby="how-heading">
      <SectionHeading
        id="how"
        eyebrow="What · Why · How"
        title="What we are building — and why it matters."
        lede="AYC is not a one-day rally. It is a civic leadership academy in motion: teams, education, public voice, and a statewide network that lasts."
      />
      <div className="how-grid">
        {HOW_WE_WORK.map((item) => (
          <article key={item.number} className="how-card card">
            <span className="pillar-card__number" aria-hidden="true">
              {item.number}
            </span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
