import { Navigate } from 'react-router-dom'

/** Contact creation ships in Phase 1D — route preserved, no business logic in 1A. */
export function NewContactPage() {
  return <Navigate to="/leader" replace />
}
