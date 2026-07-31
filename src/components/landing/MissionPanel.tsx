import { AYC_MISSION } from '@/content/ayc'
import { emphasizeMissionText, splitMissionParagraphs } from '@/content/missionFormat'
import { SectionEyebrow } from './SectionChrome'

const SUPPORTING =
  'AYC is built around the belief that young people should not merely be invited into politics after decisions are made. They should help shape those decisions from the beginning.'

export function MissionPanel() {
  const paragraphs = splitMissionParagraphs(AYC_MISSION)

  return (
    <section id="mission" className="landing__section ayc-reveal" aria-labelledby="mission-heading">
      <SectionEyebrow>Our Mission</SectionEyebrow>
      <h2 id="mission-heading" className="landing__heading">
        Turning youth voices into political action.
      </h2>
      <div className="mission-panel">
        <div className="mission-panel__text" data-testid="canonical-mission">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{emphasizeMissionText(paragraph)}</p>
          ))}
        </div>
        <aside className="mission-panel__callout">
          <p>{SUPPORTING}</p>
        </aside>
      </div>
    </section>
  )
}
