import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge, Button, Card, LoadingState, PageHeader, Section, Tag } from '@/components/ui'
import { ArchiveContactDialog } from '@/features/leader/ArchiveContactDialog'
import { ContactForm } from '@/features/leader/ContactForm'
import { initialFromDetail } from '@/features/leader/contactFormInitial'
import { LeadershipRolesPanel } from '@/features/leader/LeadershipRolesPanel'
import { PipelineTagsEditor } from '@/features/leader/PipelineTagsEditor'
import { pipelineTagLabel } from '@/features/leader/pipelineLabels'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'
import { RestoreContactDialog } from '@/features/leader/RestoreContactDialog'
import { getLeaderScope } from '@/features/leader/leaderSession'
import {
  fetchContact,
  type ContactDetail,
} from '@/features/leader/leaderApi'

function statusTone(status: string): 'green' | 'gold' | 'blue' {
  if (status === 'ARCHIVED') return 'gold'
  if (status === 'PROSPECTIVE') return 'blue'
  return 'green'
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replaceAll('_', ' ')
}

function ContactDetailView() {
  const { personId = '' } = useParams()
  const [contact, setContact] = useState<ContactDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [banner, setBanner] = useState('')

  const load = useCallback(async () => {
    if (!personId) return
    setLoading(true)
    setError('')
    const result = await fetchContact(personId)
    if (!result.ok) {
      setError(result.error.message)
      setContact(null)
      setLoading(false)
      return
    }
    setContact(result.data)
    setLoading(false)
  }, [personId])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <LoadingState label="Loading contact…" />
  }

  if (error || !contact) {
    return (
      <div>
        <PageHeader title="Contact not found" lede={error || 'This contact could not be loaded.'} />
        <Button to="/leader" variant="secondary">
          Return to Leader Board
        </Button>
      </div>
    )
  }

  const displayName =
    contact.displayName ??
    `${contact.preferredName || contact.firstName} ${contact.lastName}`.trim()
  const subtitle = [
    contact.location?.code,
    contact.primaryTeam?.name,
    contact.primaryTeam?.position === 'LEAD' ? 'Lead' : contact.primaryTeam ? 'Volunteer' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  if (editing) {
    const initial = initialFromDetail(contact)
    if (!initial) {
      return (
        <div className="error-state" role="alert">
          This contact is missing required location or team data for editing.
        </div>
      )
    }
    return (
      <ContactForm
        mode="edit"
        initial={initial}
        onCancel={() => setEditing(false)}
        onUpdated={(detail) => {
          setContact(detail)
          setEditing(false)
          setBanner('Contact Updated')
        }}
      />
    )
  }

  const archived = contact.status === 'ARCHIVED'

  return (
    <div>
      {banner ? (
        <div className="card" role="status" style={{ marginBottom: '1rem' }}>
          <strong>{banner}</strong>
          {banner === 'Contact Archived' ? (
            <p>{displayName} has been removed from active directory views.</p>
          ) : banner === 'Contact Restored' ? (
            <p>{displayName} has returned to operational views.</p>
          ) : (
            <p>{displayName}’s record has been saved.</p>
          )}
        </div>
      ) : null}

      <PageHeader
        eyebrow="Leader Contact"
        title={displayName}
        lede={subtitle || 'Leadership contact record'}
        actions={
          <>
            <Badge tone={statusTone(contact.status)}>{statusLabel(contact.status)}</Badge>
            {!archived ? (
              <Button type="button" variant="primary" onClick={() => setEditing(true)}>
                Edit Contact
              </Button>
            ) : null}
            <Button to={`/directory/${contact.id}`} variant="secondary">
              View in Directory
            </Button>
            {!archived ? (
              <Button type="button" variant="secondary" onClick={() => setArchiveOpen(true)}>
                Archive Contact
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={() => setRestoreOpen(true)}>
                Restore Contact
              </Button>
            )}
            <Button to="/leader" variant="secondary">
              Return to Leader Board
            </Button>
          </>
        }
      />

      <Section id="contact-info" title="Contact Information">
        <Card>
          <p>
            <strong>Email:</strong> {contact.email?.value ?? '—'}
          </p>
          <p>
            <strong>Phone:</strong> {contact.phone?.value ?? '—'}
          </p>
          <p>
            <strong>Preferred contact method:</strong>{' '}
            {contact.preferredContactMethod
              ? statusLabel(contact.preferredContactMethod)
              : 'Unknown'}
          </p>
          <p>
            <strong>Text-ready:</strong> {contact.textReady ? 'Yes' : 'No'}
            {contact.needsPreferred ? ' · Needs preferred method set' : ''}
          </p>
        </Card>
      </Section>

      <Section id="location" title="Location">
        <Card>
          {contact.location ? (
            <>
              <p>
                <strong>
                  {contact.location.code} · {contact.location.name}
                </strong>
              </p>
              <p>{statusLabel(contact.location.locationType)}</p>
              {contact.location.city ? <p>City: {contact.location.city}</p> : null}
              {contact.location.countyName ? <p>County: {contact.location.countyName}</p> : null}
            </>
          ) : (
            <p>No primary location on file.</p>
          )}
        </Card>
      </Section>

      <Section id="teams" title="Teams and Position">
        <Card>
          {contact.primaryTeam ? (
            <>
              <p>
                <Tag>Primary</Tag> {contact.primaryTeam.name} ·{' '}
                {contact.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}
              </p>
              <p className="field__hint">Assignment status: {statusLabel(contact.primaryTeam.status)}</p>
            </>
          ) : (
            <p>No primary team on file.</p>
          )}
          {contact.additionalTeams.length > 0 ? (
            <ul>
              {contact.additionalTeams.map((team) => (
                <li key={team.id}>
                  {team.name} · {team.position === 'LEAD' ? 'Lead' : 'Volunteer'}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </Section>

      <Section id="pipeline" title="Leadership pipeline">
        <Card>
          {contact.pipelineTags.length > 0 ? (
            <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
              {contact.pipelineTags.map((tag) => (
                <Tag key={tag}>{pipelineTagLabel(tag)}</Tag>
              ))}
            </div>
          ) : (
            <p className="field__hint">No pipeline tags yet.</p>
          )}
          {!archived ? (
            <PipelineTagsEditor
              personId={contact.id}
              initialTags={contact.pipelineTags}
              onSaved={(tags) => setContact((current) => (current ? { ...current, pipelineTags: tags } : current))}
            />
          ) : null}
        </Card>
      </Section>

      <Section id="roles" title="Leadership roles">
        <Card>
          <LeadershipRolesPanel
            personId={contact.id}
            roles={contact.leadershipRoles ?? []}
            locationId={contact.location?.id}
            canGrant={getLeaderScope()?.kind === 'master'}
            disabled={archived}
            onChange={(roles) =>
              setContact((current) => (current ? { ...current, leadershipRoles: roles } : current))
            }
          />
        </Card>
      </Section>

      <Section id="record" title="Record Information">
        <Card>
          <p>
            <strong>Participation status:</strong> {statusLabel(contact.status)}
          </p>
          <p>
            <strong>Date added:</strong> {new Date(contact.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Last updated:</strong> {new Date(contact.updatedAt).toLocaleString()}
          </p>
          <p>
            <strong>Source:</strong> {statusLabel(contact.source)}
          </p>
        </Card>
      </Section>

      {contact.recentAudit.length > 0 ? (
        <Section id="audit" title="Recent activity">
          <Card>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {contact.recentAudit.map((event) => (
                <li key={event.id}>
                  {event.changeSummary}{' '}
                  <span className="field__hint">
                    · {new Date(event.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}

      <ArchiveContactDialog
        open={archiveOpen}
        personId={contact.id}
        displayName={displayName}
        onClose={() => setArchiveOpen(false)}
        onArchived={() => {
          setBanner('Contact Archived')
          void load()
        }}
      />
      <RestoreContactDialog
        open={restoreOpen}
        personId={contact.id}
        displayName={displayName}
        onClose={() => setRestoreOpen(false)}
        onRestored={() => {
          setBanner('Contact Restored')
          void load()
        }}
      />
    </div>
  )
}

export function ContactDetailPage() {
  return (
    <RequireLeaderAccess>
      <ContactDetailView />
    </RequireLeaderAccess>
  )
}
