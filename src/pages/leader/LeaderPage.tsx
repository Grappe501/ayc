import { Badge, Card, EmptyState, PageHeader, Section, StatCard, Tag } from '@/components/ui'

export function LeaderPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Leader Board"
        title="The operational command center for AYC leadership."
        lede="Contact management, team assignments, and location management — coming in Phase 1D."
      />

      <div className="card-grid card-grid--3 section">
        <StatCard value="—" label="Active People" />
        <StatCard value="—" label="Locations" />
        <StatCard value="—" label="Teams Represented" />
      </div>

      <Section id="capabilities" title="What this board will do">
        <div className="card-grid card-grid--3">
          <Card>
            <Tag>Contacts</Tag>
            <h3>Contact management</h3>
            <p>Create, edit, archive, and restore leadership records.</p>
          </Card>
          <Card>
            <Tag>Teams</Tag>
            <h3>Team assignments</h3>
            <p>Primary and additional teams with Lead or Volunteer positions.</p>
          </Card>
          <Card>
            <Tag>Places</Tag>
            <h3>Location management</h3>
            <p>Colleges, high schools, and counties with three-letter codes.</p>
          </Card>
        </div>
      </Section>

      <EmptyState
        icon="LB"
        title="Leader Board is almost ready"
        description="Write access, contact forms, and location creation ship in Phase 1D. This shell is the home those tools will live in."
        actionTo="/"
        actionLabel="Return Home"
      >
        <Badge tone="gold">Coming in Phase 1D</Badge>
      </EmptyState>
    </div>
  )
}
