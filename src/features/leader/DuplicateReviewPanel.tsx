import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ApiError } from '@/features/leader/leaderApi'

type Props = {
  error: ApiError
  draft: {
    firstName: string
    lastName: string
    email: string
    phone: string
    locationLabel: string
    teamLabel: string
  }
  onUseExisting: (personId: string) => void
  onCreateDifferent: () => void
  onReturn: () => void
}

export function DuplicateReviewPanel({
  error,
  draft,
  onUseExisting,
  onCreateDifferent,
  onReturn,
}: Props) {
  const exact = error.duplicateResult === 'EXACT_MATCH'
  const likely = error.duplicateResult === 'LIKELY_MATCH'
  const title = exact
    ? 'This contact already appears to exist.'
    : likely
      ? 'This person may already be in the directory.'
      : 'We found a possible match.'

  return (
    <div className="card" role="alertdialog" aria-label="Duplicate review">
      <h2>{title}</h2>
      <p>
        {exact
          ? 'Open the existing record instead of creating a duplicate.'
          : 'Review the existing record before creating a new person.'}
      </p>

      <div className="card-grid card-grid--2" style={{ marginTop: '1rem' }}>
        <Card>
          <p className="card__eyebrow">New entry</p>
          <h3>
            {draft.firstName} {draft.lastName}
          </h3>
          <p>{draft.email || 'No email'}</p>
          <p>{draft.phone || 'No phone'}</p>
          <p>{draft.locationLabel}</p>
          <p>{draft.teamLabel}</p>
        </Card>
        {(error.candidates ?? []).map((candidate) => (
          <Card key={candidate.id}>
            <p className="card__eyebrow">Existing record · {candidate.status}</p>
            <h3>
              {candidate.preferredName || candidate.firstName} {candidate.lastName}
            </h3>
            <p>{candidate.emails[0] ?? 'No email on file'}</p>
            <p>{candidate.phones[0] ?? 'No phone on file'}</p>
            <div className="btn-row" style={{ marginTop: '0.75rem' }}>
              <Button
                type="button"
                variant="primary"
                onClick={() => onUseExisting(candidate.id)}
              >
                Use Existing Record
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="btn-row" style={{ marginTop: '1.25rem' }}>
        {!exact ? (
          <Button type="button" variant="primary" onClick={onCreateDifferent}>
            Create as a Different Person
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onReturn}>
          Return to Form
        </Button>
      </div>
    </div>
  )
}
