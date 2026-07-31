import type { ReactNode } from 'react'
import { Button } from './Button'

type Props = {
  icon?: string
  title: string
  description: string
  actionTo?: string
  actionLabel?: string
  children?: ReactNode
}

export function EmptyState({ icon = 'AYC', title, description, actionTo, actionLabel, children }: Props) {
  return (
    <div className="card empty-state ayc-fade-in">
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
      {actionTo && actionLabel ? (
        <div className="btn-row">
          <Button to={actionTo} variant="primary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
