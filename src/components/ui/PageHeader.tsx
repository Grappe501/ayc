type Props = {
  eyebrow?: string
  title: string
  lede?: string
}

export function PageHeader({ eyebrow, title, lede }: Props) {
  return (
    <header className="page-header ayc-fade-up">
      {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
      <h1 className="page-header__title">{title}</h1>
      {lede ? <p className="page-header__lede">{lede}</p> : null}
    </header>
  )
}
