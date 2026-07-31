import type { ReactNode } from 'react'

export function Badge({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'gold' | 'blue' }) {
  const toneClass = tone === 'gold' ? 'badge--gold' : tone === 'blue' ? 'badge--blue' : ''
  return <span className={`badge ${toneClass}`.trim()}>{children}</span>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>
}

export function Divider() {
  return <hr className="divider" />
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="btn-row" role="status" aria-label={label ?? 'Loading'}>
      <span className="spinner" aria-hidden="true" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}
