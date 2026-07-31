import { Button } from '@/components/ui'

export function FinalCallToAction() {
  return (
    <section
      id="begin"
      className="landing__section final-cta ayc-reveal"
      aria-labelledby="begin-heading"
    >
      <p className="landing__eyebrow">Start Here</p>
      <h2 id="begin-heading">This is where the network begins.</h2>
      <p>
        Start with the people already ready to lead. Build the directory. Strengthen the teams. Let
        the leadership experience guide what comes next.
      </p>
      <div className="btn-row">
        <Button to="/leader" variant="primary">
          Enter the Leader Board
        </Button>
        <Button to="/directory" variant="secondary">
          Explore the Directory
        </Button>
      </div>
    </section>
  )
}
