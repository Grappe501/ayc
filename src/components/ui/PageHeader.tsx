import type { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  lede?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, lede, actions }: Props) {
  return (
    <header className="page-header ayc-fade-up">
      {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
      <h1 className="page-header__title">{title}</h1>
      {lede ? <p className="page-header__lede">{lede}</p> : null}
      {actions ? <div className="btn-row" style={{ marginTop: '1rem' }}>{actions}</div> : null}
    </header>
  )
}
