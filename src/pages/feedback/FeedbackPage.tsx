import { Badge, EmptyState, PageHeader } from '@/components/ui'

export function FeedbackPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Leadership Feedback"
        title="Help shape the Workbench."
        lede="Every page will invite leaders to report problems, suggest improvements, and request features."
      />

      <EmptyState
        icon="FB"
        title="Beta feedback launches in Phase 1G"
        description="Structured feedback categories, page context, and reference codes ship next. For now, this is the home for leadership input."
        actionTo="/"
        actionLabel="Return Home"
      >
        <Badge tone="gold">Coming in Phase 1G</Badge>
      </EmptyState>
    </div>
  )
}
