import type { ReactNode } from 'react'
import { AycLogoMark } from '@/components/brand/AycLogoMark'
import { Button } from './Button'

type Props = {
  /** Optional text icon override. Default is the AYC logo mark. */
  icon?: string
  title: string
  description: string
  actionTo?: string
  actionLabel?: string
  children?: ReactNode
}

export function EmptyState({ icon, title, description, actionTo, actionLabel, children }: Props) {
  return (
    <div className="card empty-state ayc-fade-in">
      <div className="empty-state__icon" aria-hidden="true">
        {icon ? icon : <AycLogoMark size="sm" decorative />}
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
