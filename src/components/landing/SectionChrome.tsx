import type { ReactNode } from 'react'

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="landing__eyebrow">{children}</p>
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
}: {
  id?: string
  eyebrow: string
  title: string
  lede?: string
}) {
  const headingId = id ? `${id}-heading` : undefined
  return (
    <header className="landing__section-header">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2 id={headingId} className="landing__heading">
        {title}
      </h2>
      {lede ? <p className="landing__lede">{lede}</p> : null}
    </header>
  )
}

export function ResponsiveCardGrid({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}
