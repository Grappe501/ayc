import type { ReactNode } from 'react'
import { Button } from './Button'

type Props = {
  eyebrow?: string
  title: string
  mission?: string
  children?: ReactNode
  primaryTo?: string
  primaryLabel?: string
  secondaryTo?: string
  secondaryLabel?: string
}

export function Hero({
  eyebrow = 'Arkansas Youth Coalition',
  title,
  mission,
  children,
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
}: Props) {
  return (
    <section className="hero ayc-fade-up" aria-labelledby="hero-heading">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__content">
        <p className="page-header__eyebrow">{eyebrow}</p>
        <h1 id="hero-heading">{title}</h1>
        {mission ? <p className="hero__mission">{mission}</p> : null}
        {children}
        {(primaryTo || secondaryTo) && (
          <div className="btn-row">
            {primaryTo && primaryLabel ? (
              <Button to={primaryTo} variant="primary">
                {primaryLabel}
              </Button>
            ) : null}
            {secondaryTo && secondaryLabel ? (
              <Button to={secondaryTo} variant="secondary">
                {secondaryLabel}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
