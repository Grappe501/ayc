import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  interactive?: boolean
  as?: 'article' | 'div' | 'section'
}

export function Card({ children, className = '', interactive = false, as: Tag = 'article' }: Props) {
  return (
    <Tag className={`card ${interactive ? 'card--interactive' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  )
}
