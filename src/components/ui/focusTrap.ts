const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  )
}

/** Trap Tab within container; call from keydown listener. */
export function trapTabKey(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab') return
  const focusable = getFocusable(container)
  if (focusable.length === 0) {
    event.preventDefault()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault()
      last.focus()
    }
    return
  }

  if (active === last || !container.contains(active)) {
    event.preventDefault()
    first.focus()
  }
}

export function focusFirst(container: HTMLElement): void {
  const focusable = getFocusable(container)
  ;(focusable[0] ?? container).focus()
}
