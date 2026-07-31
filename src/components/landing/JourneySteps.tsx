import { JOURNEY_STEPS } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function JourneySteps() {
  return (
    <section id="how" className="landing__section ayc-reveal" aria-labelledby="how-heading">
      <SectionHeading
        id="how"
        eyebrow="The Path"
        title="How We Get There"
        lede="A clear progression from listening to leading — without dead ends."
      />
      <ol className="journey">
        {JOURNEY_STEPS.map((step, index) => (
          <li key={step.word} className="journey-step">
            <span className="journey-step__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="journey-step__word">{step.word}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
