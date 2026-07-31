import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { AYC_PAGE_DESCRIPTION, AYC_PAGE_TITLE } from '@/content/ayc'
import { LandingHero } from '@/components/landing/LandingHero'
import { MissionPanel } from '@/components/landing/MissionPanel'
import { InsightCards } from '@/components/landing/InsightCards'
import { PillarCards } from '@/components/landing/PillarCards'
import { JourneySteps } from '@/components/landing/JourneySteps'
import { TeamCards } from '@/components/landing/TeamCards'
import { WorkbenchActionCards } from '@/components/landing/WorkbenchActionCards'
import { BetaLoop } from '@/components/landing/BetaLoop'
import { FinalCallToAction } from '@/components/landing/FinalCallToAction'
import './landing.css'

export function HomePage() {
  return (
    <div className="landing">
      <DocumentMeta title={AYC_PAGE_TITLE} description={AYC_PAGE_DESCRIPTION} />
      <LandingHero />
      <MissionPanel />
      <InsightCards />
      <PillarCards />
      <JourneySteps />
      <TeamCards />
      <WorkbenchActionCards />
      <BetaLoop />
      <FinalCallToAction />
    </div>
  )
}
