import { Button } from '@/components/ui'

export function LandingHero() {
  return (
    <section className="landing-hero ayc-reveal" aria-labelledby="hero-heading">
      <div className="landing-hero__copy">
        <p className="landing__eyebrow landing-hero__eyebrow">Arkansas Youth Coalition</p>
        <h1 id="hero-heading">
          Young Arkansans are not waiting for the future.
          <br />
          We are building it.
        </h1>
        <p className="landing-hero__support">
          AYC is building a statewide network of young people ages 16–24 who are ready to organize,
          vote, lead, gather, speak directly with policymakers, and turn youth priorities into
          political action.
        </p>
        <div className="btn-row">
          <Button to="/leader" variant="primary">
            Enter the Leader Board
          </Button>
          <Button to="/directory" variant="secondary">
            View the Leadership Directory
          </Button>
        </div>
        <p>
          <a className="mission-link" href="#mission">
            Read Our Mission
          </a>
        </p>
      </div>

      <div className="landing-hero__visual" aria-hidden="true">
        <div className="landing-hero__map" />
        <div className="landing-hero__lines" />
        <div className="landing-hero__nodes">
          <span className="landing-hero__node" />
          <span className="landing-hero__node landing-hero__node--gold" />
          <span className="landing-hero__node landing-hero__node--blue" />
          <span className="landing-hero__node" />
          <span className="landing-hero__node landing-hero__node--gold" />
        </div>
      </div>
    </section>
  )
}
