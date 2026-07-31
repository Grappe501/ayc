import { Button, Card } from '@/components/ui'
import { BETA_LOOP } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function BetaLoop() {
  return (
    <section id="beta" className="landing__section ayc-reveal" aria-labelledby="beta-heading">
      <SectionHeading id="beta" eyebrow="Leadership Beta" title="Built With the Leadership Team" />
      <Card className="glass">
        <p>
          The Workbench will not be completed behind closed doors and handed to AYC leaders as a
          finished system.
        </p>
        <p>
          Each phase will be tested by the leadership team. Their experience will determine what is
          confusing, what is missing, and what should be built next.
        </p>
        <div className="beta-loop" aria-label="Beta improvement loop">
          {BETA_LOOP.map((step, index) => (
            <span key={step} className="beta-loop__item">
              <span>{step}</span>
              {index < BETA_LOOP.length - 1 ? (
                <span className="beta-loop__arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <Button to="/feedback" variant="primary">
          Share Beta Feedback
        </Button>
      </Card>
    </section>
  )
}
