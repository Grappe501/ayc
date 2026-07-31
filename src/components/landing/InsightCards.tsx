import { Card } from '@/components/ui'
import { HEARD_INSIGHTS } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function InsightCards() {
  return (
    <section id="heard" className="landing__section ayc-reveal" aria-labelledby="heard-heading">
      <SectionHeading
        id="heard"
        eyebrow="The Need"
        title="Here’s What We Heard"
        lede="AYC exists because young Arkansans are ready for real participation — and the path into politics is still too hard to find."
      />
      <div className="insight-grid">
        {HEARD_INSIGHTS.map((item) => (
          <Card key={item.title} interactive>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
