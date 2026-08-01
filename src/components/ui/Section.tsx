import type { ReactNode } from 'react'

type Props = {
  id?: string
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  className = '',
}: Props) {
  return (
    <section id={id} className={`section ${className}`.trim()} aria-labelledby={title ? `${id ?? 'section'}-title` : undefined}>
      {(eyebrow || title || description || actions) && (
        <div className="section__header">
          {eyebrow ? <p className="card__eyebrow">{eyebrow}</p> : null}
          {title ? (
            <h2 id={`${id ?? 'section'}-title`}>{title}</h2>
          ) : null}
          {description ? <p className="page-header__lede">{description}</p> : null}
          {actions ? <div className="btn-row">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}
