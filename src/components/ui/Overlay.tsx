import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import { focusFirst, trapTabKey } from './focusTrap'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

function useDialogFocus(open: boolean, onClose: () => void, panelRef: React.RefObject<HTMLElement | null>) {
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (panel) {
      // Defer so content is mounted
      requestAnimationFrame(() => focusFirst(panel))
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (panel) trapTabKey(e, panel)
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previousFocus.current?.focus?.()
    }
  }, [open, onClose, panelRef])
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogFocus(open, onClose, panelRef)

  if (!open) return null

  return (
    <div
      className="ayc-modal-root"
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(10, 34, 64, 0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
      }}
    >
      <div
        ref={panelRef}
        className="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(32rem, 100%)', maxHeight: '85vh', overflow: 'auto' }}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogFocus(open, onClose, panelRef)

  if (!open) return null

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(10, 34, 64, 0.4)',
      }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(22rem, 92vw)',
          borderRadius: 0,
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="glass"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        padding: '0.85rem 1.2rem',
        borderRadius: '999px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {message}
    </div>
  )
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span title={label} aria-label={label}>
      {children}
    </span>
  )
}
