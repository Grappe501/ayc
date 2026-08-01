import { Badge, Button, Card, EmptyState, Tag } from '@/components/ui'
import type { LeaderRosterRow } from '@/features/leader/leaderApi'
import { pipelineTagLabel } from '@/features/leader/pipelineLabels'
import { preferredLabel } from '@/features/leader/textReadyLabels'
import { positionOnTeam } from '@/features/leader/teamBoards'

function labelStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

type Props = {
  people: LeaderRosterRow[]
  emptyTitle: string
  emptyDescription: string
  emptyBadge?: string
  /** When set, Position column reflects role on this team. */
  focusTeamSlug?: string
  onAssign: (person: LeaderRosterRow) => void
}

export function LeaderRosterList({
  people,
  emptyTitle,
  emptyDescription,
  emptyBadge,
  focusTeamSlug,
  onAssign,
}: Props) {
  if (people.length === 0) {
    return (
      <EmptyState
        icon="+"
        title={emptyTitle}
        description={emptyDescription}
        actionTo="/leader/contacts/new"
        actionLabel="Add a Contact"
      >
        {emptyBadge ? <Badge tone="gold">{emptyBadge}</Badge> : null}
      </EmptyState>
    )
  }

  return (
    <>
      <div className="leader-roster-desktop leader-roster-table-wrap">
        <table className="leader-roster-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>{focusTeamSlug ? 'Role on team' : 'Primary team'}</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => {
              const focusPosition = focusTeamSlug
                ? positionOnTeam(person, focusTeamSlug)
                : null
              return (
                <tr key={person.id}>
                  <td>
                    <strong>{person.displayName}</strong>
                    {person.additionalTeams.length > 0 ? (
                      <div className="field__hint">
                        Also: {person.additionalTeams.map((t) => t.name).join(', ')}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    {person.location
                      ? `${person.location.code} · ${person.location.name}`
                      : '—'}
                  </td>
                  <td>
                    {focusTeamSlug ? (
                      focusPosition ? (
                        <>
                          {focusPosition === 'LEAD' ? 'Lead' : 'Volunteer'}
                          {person.primaryTeam?.slug !== focusTeamSlug ? (
                            <div className="field__hint">
                              Primary: {person.primaryTeam?.name ?? '—'}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <span className="leader-gap">Assign team</span>
                      )
                    ) : person.primaryTeam ? (
                      <>
                        {person.primaryTeam.name}
                        <div className="field__hint">
                          {person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}
                        </div>
                      </>
                    ) : (
                      <span className="leader-gap">Assign team</span>
                    )}
                  </td>
                  <td>
                    {person.missingContact ? (
                      <span className="leader-gap">Needs phone/email</span>
                    ) : (
                      <>
                        <div>
                          {person.hasEmail ? 'Email' : null}
                          {person.hasEmail && person.hasPhone ? ' · ' : null}
                          {person.hasPhone ? 'Phone' : null}
                        </div>
                        <div className="field__hint">
                          Prefers {preferredLabel(person.preferredContactMethod)}
                          {person.textReady ? ' · Text-ready' : null}
                          {person.needsPreferred ? ' · Set preferred' : null}
                        </div>
                      </>
                    )}
                  </td>
                  <td>
                    {labelStatus(person.status)}
                    {person.source === 'JOIN_FORM' ? (
                      <div className="field__hint">Joined via form</div>
                    ) : null}
                    {person.textReady ? <div className="field__hint">Text-ready</div> : null}
                    {person.pipelineTags.length > 0 ? (
                      <div className="field__hint">
                        {person.pipelineTags.map((tag) => pipelineTagLabel(tag)).join(' · ')}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <div className="btn-row">
                      <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                        {person.missingContact ? 'Fill contact' : 'Open'}
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => onAssign(person)}
                      >
                        Assign team
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="leader-roster-mobile">
        {people.map((person) => {
          const focusPosition = focusTeamSlug
            ? positionOnTeam(person, focusTeamSlug)
            : null
          return (
            <Card key={person.id}>
              <Tag>{labelStatus(person.status)}</Tag>
              {person.source === 'JOIN_FORM' ? <Tag>Joined via form</Tag> : null}
              {person.textReady ? <Tag>Text-ready</Tag> : null}
              {person.needsPreferred ? <Tag>Needs preferred</Tag> : null}
              {person.pipelineTags.map((tag) => (
                <Tag key={tag}>{pipelineTagLabel(tag)}</Tag>
              ))}
              <h3>{person.displayName}</h3>
              <p>
                {person.location
                  ? `${person.location.code} · ${person.location.name}`
                  : 'No location'}
              </p>
              <p>
                {focusTeamSlug
                  ? focusPosition
                    ? `${focusPosition === 'LEAD' ? 'Lead' : 'Volunteer'} on this team`
                    : 'No role on this team'
                  : person.primaryTeam
                    ? `${person.primaryTeam.name} · ${person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}`
                    : 'No team assigned'}
              </p>
              {person.missingContact ? (
                <p className="leader-gap">Needs phone/email</p>
              ) : (
                <p className="field__hint">
                  Prefers {preferredLabel(person.preferredContactMethod)}
                </p>
              )}
              <div className="btn-row">
                <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                  {person.missingContact ? 'Fill contact' : 'Open'}
                </Button>
                <Button type="button" variant="primary" onClick={() => onAssign(person)}>
                  Assign team
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
