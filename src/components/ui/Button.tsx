import { Link } from 'react-router-dom'
import type { AriaAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary'

type Base = {
  children: ReactNode
  variant?: Variant
  className?: string
  'aria-current'?: AriaAttributes['aria-current']
}

type AsButton = Base &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
  }

type AsLink = Base & {
  to: string
}

export function Button(props: AsButton | AsLink) {
  const variant = props.variant ?? 'primary'
  const className = `btn btn--${variant} ${props.className ?? ''}`.trim()

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={className} aria-current={props['aria-current']}>
        {props.children}
      </Link>
    )
  }

  const button = props as AsButton
  return (
    <button
      type={button.type ?? 'button'}
      className={className}
      disabled={button.disabled}
      onClick={button.onClick}
      aria-label={button['aria-label']}
      aria-current={button['aria-current']}
    >
      {button.children}
    </button>
  )
}
