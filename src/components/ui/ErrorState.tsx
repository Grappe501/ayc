import { Button } from './Button'

type Props = {
  title?: string
  message: string
  actionTo?: string
  actionLabel?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  actionTo,
  actionLabel = 'Return Home',
}: Props) {
  return (
    <div className="error-state" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {actionTo ? (
        <Button to={actionTo} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
