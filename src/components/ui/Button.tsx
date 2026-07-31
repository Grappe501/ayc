import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './ui.css'

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger'

type BaseProps = {
  children: ReactNode
  variant?: ButtonVariant
  className?: string
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
  }

type ButtonAsLink = BaseProps & {
  to: string
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const variant = props.variant ?? 'primary'
  const className = `btn btn--${variant} ${props.className ?? ''}`.trim()

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={className}>
        {props.children}
      </Link>
    )
  }

  const buttonProps = props as ButtonAsButton
  return (
    <button
      type={buttonProps.type ?? 'button'}
      className={className}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
    >
      {buttonProps.children}
    </button>
  )
}
