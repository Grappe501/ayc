import { Button } from '@/components/ui'
import logoMark from '@/assets/brand/ayc-logo-mark-f.png'

export function LandingHero() {
  return (
    <section className="landing-hero ayc-reveal" aria-labelledby="hero-heading">
      <img
        className="landing-hero__mark"
        src={logoMark}
        alt="Arkansas Youth Coalition"
        width={240}
        height={240}
      />
      <div className="landing-hero__copy">
        <p className="landing__eyebrow landing-hero__eyebrow">Arkansas Youth Coalition</p>
        <h1 id="hero-heading">A home for young Arkansans ready to lead.</h1>
        <p className="landing-hero__support">
          AYC is a statewide civic leadership network for ages 16–24 — college students, high school
          students, and working-class young people building political power together. This is the
          moment to get in at the start.
        </p>
        <div className="btn-row">
          <Button to="/join" variant="primary">
            Join AYC
          </Button>
          <Button to="#why" variant="secondary">
            Why this matters
          </Button>
        </div>
      </div>
    </section>
  )
}
