import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  LoadingState,
  PageHeader,
  Section,
  StatCard,
  Tag,
} from '@/components/ui'
import { teamBoardPath } from '@/features/leader/accessScope'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { clearLeaderSession } from '@/features/leader/leaderSession'
import {
  fetchLeaderReports,
  type LeaderReportsPayload,
} from '@/features/leader/leaderApi'
import './leader-board.css'
import './reports.css'

function labelStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function ReportsHub() {
  const [data, setData] = useState<LeaderReportsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const result = await fetchLeaderReports()
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      setData(result.data)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="reports-page">
      <PageHeader
        eyebrow="Lead Organizer"
        title="Reports"
        lede="Where AYC is thin on leads, and who just signed up — Chance’s operating view."
        actions={
          <>
            <Button to="/leader" variant="secondary">
              Leader Board
            </Button>
            <Button to="/leader/applications" variant="primary">
              Join applications
            </Button>
            <Button to="/leader/access-log" variant="secondary">
              Access log
            </Button>
            <Button to="/leader/gaps" variant="secondary">
              Contact gaps
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                clearLeaderSession()
                window.location.assign('/leader')
              }}
            >
              Lock Board
            </Button>
          </>
        }
      />

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? <LoadingState label="Loading reports…" /> : null}

      {data ? (
        <>
          <p className="field__hint">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>

          <div className="stat-grid">
            <StatCard label="Active people" value={String(data.summary.activePeople)} />
            <StatCard label="Team leads" value={String(data.summary.leads)} />
            <StatCard
              label="Open applications"
              value={String(data.summary.openApplications)}
            />
            <StatCard
              label="Thin locations"
              value={String(data.summary.thinLocations)}
            />
            <StatCard
              label="Teams without lead"
              value={String(data.summary.teamsWithoutLead)}
            />
            <StatCard
              label="Team open items"
              value={String(data.summary.totalOpenTeamItems)}
            />
          </div>

          <Section id="signups" title="Who just signed up">
            <div className="reports-split">
              <Card>
                <h3>Join applications</h3>
                <div className="stat-grid reports-stat-grid">
                  <StatCard label="New" value={String(data.applicationPipeline.NEW)} />
                  <StatCard
                    label="Reviewing"
                    value={String(data.applicationPipeline.REVIEWING)}
                  />
                  <StatCard
                    label="Accepted"
                    value={String(data.applicationPipeline.ACCEPTED)}
                  />
                  <StatCard
                    label="Open queue"
                    value={String(data.applicationPipeline.open)}
                  />
                </div>
                {data.recentApplications.length === 0 ? (
                  <p className="field__hint">No applications yet.</p>
                ) : (
                  <ul className="reports-list">
                    {data.recentApplications.slice(0, 12).map((app) => (
                      <li key={app.id}>
                        <div>
                          <strong>
                            {app.firstName} {app.lastName}
                          </strong>
                          <span className="field__hint">
                            {' '}
                            · {app.primaryTeamInterest} · {app.locationInterestType}
                          </span>
                        </div>
                        <div className="reports-list__meta">
                          <Tag>{labelStatus(app.status)}</Tag>
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="btn-row">
                  <Button to="/leader/applications" variant="primary">
                    Open applications inbox
                  </Button>
                </div>
              </Card>

              <Card>
                <h3>Accepted join people</h3>
                <p className="field__hint">
                  Prospective contacts created from accepted applications (JOIN_FORM).
                </p>
                {data.recentJoinPeople.length === 0 ? (
                  <p className="field__hint">None yet.</p>
                ) : (
                  <ul className="reports-list">
                    {data.recentJoinPeople.map((person) => (
                      <li key={person.id}>
                        <Button
                          to={`/leader/contacts/${person.id}`}
                          variant="secondary"
                        >
                          {person.displayName}
                        </Button>
                        <div className="reports-list__meta">
                          <Tag>{labelStatus(person.status)}</Tag>
                          <span>
                            {new Date(person.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </Section>

          <Section id="coverage" title="Where we are thin on leads">
            <div className="reports-split">
              <Card>
                <h3>Category boards</h3>
                <p className="field__hint">
                  Statewide teams missing a LEAD seat or carrying open attention items.
                </p>
                <ul className="reports-list">
                  {data.teamCoverage.digests.map((team) => (
                    <li key={team.slug}>
                      <div>
                        <strong>
                          {team.mark} {team.name}
                        </strong>
                        <span className="field__hint">
                          {' '}
                          · {team.leads} lead · {team.openItems} open
                        </span>
                        {team.topIssues.length > 0 ? (
                          <p className="field__hint">{team.topIssues.join(' · ')}</p>
                        ) : null}
                      </div>
                      <div className="reports-list__meta">
                        {team.noLead ? <Tag>No lead</Tag> : <Tag>Has lead</Tag>}
                        <Button
                          to={teamBoardPath(team.slug)}
                          variant="secondary"
                        >
                          Open board
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <h3>Location coverage</h3>
                <div className="stat-grid reports-stat-grid">
                  <StatCard
                    label="Thin locations"
                    value={String(data.locationCoverage.thinCount)}
                  />
                  <StatCard
                    label="No LOCATION_LEAD"
                    value={String(data.locationCoverage.thinFormalLeadCount)}
                  />
                  <StatCard
                    label="HS thin"
                    value={String(data.locationCoverage.thinBySegment.highSchool)}
                  />
                  <StatCard
                    label="County thin"
                    value={String(data.locationCoverage.thinBySegment.workingClass)}
                  />
                </div>
                <p className="field__hint">
                  Thin = missing a granted Location Lead role, or no local-lead /
                  ready-to-lead pipeline at that place.
                </p>
                <ul className="reports-list">
                  {data.locationCoverage.locations
                    .filter((location) => location.thin)
                    .slice(0, 20)
                    .map((location) => (
                      <li key={location.id}>
                        <div>
                          <strong>
                            {location.code} {location.name}
                          </strong>
                          <span className="field__hint">
                            {' '}
                            · {location.locationType} · {location.rosterCount} people
                          </span>
                        </div>
                        <div className="reports-list__meta">
                          {location.thinFormalLead ? (
                            <Tag>No location lead</Tag>
                          ) : null}
                          {location.thinPipeline ? <Tag>Thin pipeline</Tag> : null}
                          <Button
                            to={`/leader/locations/${location.id}`}
                            variant="secondary"
                          >
                            TEAM board
                          </Button>
                        </div>
                      </li>
                    ))}
                </ul>
                {data.locationCoverage.thinCount === 0 ? (
                  <p className="field__hint">No thin locations right now.</p>
                ) : null}
                <div className="btn-row">
                  <Button to="/leader/segments/high-school" variant="secondary">
                    HS segment
                  </Button>
                  <Button to="/leader/segments/working-class" variant="secondary">
                    WC segment
                  </Button>
                </div>
              </Card>
            </div>
          </Section>

          <Section id="roster-gaps" title="Roster completeness">
            <Card>
              <div className="stat-grid reports-stat-grid">
                <StatCard
                  label="Missing contact"
                  value={String(data.attention.missingContact)}
                />
                <StatCard
                  label="Prospective"
                  value={String(data.attention.prospective)}
                />
                <StatCard
                  label="Join form people"
                  value={String(data.attention.joinForm)}
                />
                <StatCard
                  label="Local lead candidates"
                  value={String(data.attention.localLeadCandidate)}
                />
                <StatCard
                  label="Ready to lead"
                  value={String(data.attention.readyToLead)}
                />
                <StatCard
                  label="Needs mentoring"
                  value={String(data.attention.needsMentoring)}
                />
              </div>
              <div className="btn-row">
                <Button to="/leader/gaps" variant="primary">
                  Fill contact gaps
                </Button>
                <Button to="/leader" variant="secondary">
                  Full Leader Board
                </Button>
              </div>
            </Card>
          </Section>

          <Section id="activity" title="Recent team assignments">
            <Card>
              {data.recentAssignments.length === 0 ? (
                <p className="field__hint">No recent assignments.</p>
              ) : (
                <ul className="reports-list">
                  {data.recentAssignments.map((row) => (
                    <li key={row.id}>
                      <div>
                        <Button
                          to={`/leader/contacts/${row.personId}`}
                          variant="secondary"
                        >
                          {row.displayName}
                        </Button>
                        <span className="field__hint">
                          {' '}
                          → {row.teamName} ({row.position})
                        </span>
                      </div>
                      <span className="field__hint">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Section>
        </>
      ) : null}
    </div>
  )
}

export function ReportsPage() {
  return (
    <RequireLeaderAccess requireMaster>
      <ReportsHub />
    </RequireLeaderAccess>
  )
}
