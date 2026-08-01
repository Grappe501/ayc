import { JOURNEY_STEPS } from '@/content/ayc'
import { SectionHeading } from './SectionChrome'

export function JourneySteps() {
  return (
    <section id="path" className="landing__section ayc-reveal" aria-labelledby="path-heading">
      <SectionHeading
        id="path"
        eyebrow="The path"
        title="From listening to leading."
        lede="A clear progression for every young Arkansan — volunteer first, lead when you are ready, no dead ends."
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
