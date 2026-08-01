import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { LANDING_PAGE_DESCRIPTION, LANDING_PAGE_TITLE } from '@/content/landing'
import { LandingHero } from '@/components/landing/LandingHero'
import { MomentumStrip } from '@/components/landing/MomentumStrip'
import { MissionPanel } from '@/components/landing/MissionPanel'
import { HowWeWork } from '@/components/landing/HowWeWork'
import { WhySections } from '@/components/landing/WhySections'
import { JourneySteps } from '@/components/landing/JourneySteps'
import { TeamCards } from '@/components/landing/TeamCards'
import { JoinCallToAction } from '@/components/landing/JoinCallToAction'
import { LeadershipEntry } from '@/components/landing/LeadershipEntry'
import './landing.css'

export function HomePage() {
  return (
    <div className="landing">
      <DocumentMeta title={LANDING_PAGE_TITLE} description={LANDING_PAGE_DESCRIPTION} />
      <LandingHero />
      <MomentumStrip />
      <MissionPanel />
      <HowWeWork />
      <WhySections />
      <JourneySteps />
      <TeamCards />
      <JoinCallToAction />
      <LeadershipEntry />
    </div>
  )
}
