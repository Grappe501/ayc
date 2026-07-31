import { Badge, Card, EmptyState, PageHeader, Section, StatCard, Tag } from '@/components/ui'

export function DirectoryPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Leadership Directory"
        title="Find leaders across Arkansas."
        lede="People, teams, and locations — search and filters arrive in Phase 1F."
      />

      <div className="card-grid card-grid--3 section">
        <StatCard value="—" label="People" />
        <StatCard value="5" label="Teams" />
        <StatCard value="—" label="Locations" />
      </div>

      <Section id="views" title="Directory views">
        <div className="card-grid card-grid--3">
          <Card interactive>
            <Tag>People</Tag>
            <h3>People</h3>
            <p>Browse leaders and volunteers by name, school, county, and role.</p>
          </Card>
          <Card interactive>
            <Tag>Teams</Tag>
            <h3>Teams</h3>
            <p>See how the statewide network is distributed across the five teams.</p>
          </Card>
          <Card interactive>
            <Tag>Places</Tag>
            <h3>Locations</h3>
            <p>Colleges, high schools, and counties represented in AYC.</p>
          </Card>
        </div>
      </Section>

      <EmptyState
        icon="DIR"
        title="The directory is ready for its first contact"
        description="Once leaders begin entering people, this board becomes the shared statewide view."
        actionTo="/leader"
        actionLabel="Open Leader Board"
      >
        <Badge tone="gold">Coming in Phase 1F</Badge>
      </EmptyState>
    </div>
  )
}
