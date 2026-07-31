type Props = {
  value: string
  label: string
}

export function StatCard({ value, label }: Props) {
  return (
    <article className="card stat-card">
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__label">{label}</p>
    </article>
  )
}
