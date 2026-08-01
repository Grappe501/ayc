import { Button } from '@/components/ui'

export function JoinCallToAction() {
  return (
    <section
      id="join"
      className="landing__section final-cta ayc-reveal"
      aria-labelledby="join-heading"
    >
      <p className="landing__eyebrow">Call to action</p>
      <h2 id="join-heading">Ready to join Arkansas Youth Coalition?</h2>
      <p>
        Tell us who you are, which team fits you, and whether you want to volunteer or lead. Chance
        and the leadership team follow up with people ready to build.
      </p>
      <div className="btn-row">
        <Button to="/join" variant="primary">
          Start your join form
        </Button>
        <Button to="/directory" variant="secondary">
          Meet people already building
        </Button>
      </div>
    </section>
  )
}
