export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="btn-row">
        <span className="spinner" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  )
}
