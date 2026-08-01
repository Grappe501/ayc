import { MOMENTUM_STATS } from '@/content/landing'

export function MomentumStrip() {
  return (
    <section
      id="momentum"
      className="landing__section momentum-strip ayc-reveal"
      aria-label="AYC momentum"
    >
      <div className="momentum-strip__grid">
        {MOMENTUM_STATS.map((stat) => (
          <article key={stat.label} className="momentum-strip__item">
            <p className="momentum-strip__value">{stat.value}</p>
            <p className="momentum-strip__label">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
