import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge, Button, Card, LoadingState, PageHeader, Section, Tag } from '@/components/ui'
import {
  fetchDirectoryPerson,
  type DirectoryPersonDetail,
} from '@/features/directory/directoryApi'
import { hasLeaderSession } from '@/features/leader/leaderSession'

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ')
}

export function DirectoryPersonPage() {
  const { personId = '' } = useParams()
  const [person, setPerson] = useState<DirectoryPersonDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const leader = hasLeaderSession()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const result = await fetchDirectoryPerson(personId)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setPerson(null)
      } else {
        setPerson(result.data)
        setError('')
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [personId])

  if (loading) return <LoadingState label="Loading profile…" />

  if (error || !person) {
    return (
      <div>
        <PageHeader title="Person not found" lede={error || 'This profile could not be loaded.'} />
        <Button to="/directory" variant="secondary">
          Back to Directory
        </Button>
      </div>
    )
  }

  const subtitle = [
    person.location ? `${person.location.code} · ${person.location.name}` : null,
    person.primaryTeam?.name,
    person.primaryTeam?.position === 'LEAD'
      ? 'Lead'
      : person.primaryTeam
        ? 'Volunteer'
        : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div>
      <PageHeader
        eyebrow="Directory Profile"
        title={person.displayName}
        lede={subtitle || 'AYC leadership profile'}
        actions={
          <>
            <Badge tone={person.status === 'ARCHIVED' ? 'gold' : 'green'}>
              {label(person.status)}
            </Badge>
            <Button to="/directory" variant="secondary">
              Back to Directory
            </Button>
            {leader ? (
              <Button to={`/leader/contacts/${person.id}`} variant="primary">
                Edit Contact
              </Button>
            ) : null}
          </>
        }
      />

      <Section id="team" title="Team">
        <Card>
          {person.primaryTeam ? (
            <>
              <p>
                <Tag>Primary</Tag> {person.primaryTeam.name} ·{' '}
                {person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}
              </p>
              {person.additionalTeams.length > 0 ? (
                <ul>
                  {person.additionalTeams.map((team) => (
                    <li key={team.id}>
                      {team.name} · {team.position === 'LEAD' ? 'Lead' : 'Volunteer'}
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p>No team assignment on file.</p>
          )}
        </Card>
      </Section>

      <Section id="location" title="Location">
        <Card>
          {person.location ? (
            <>
              <p>
                <strong>
                  {person.location.code} · {person.location.name}
                </strong>
              </p>
              <p>{label(person.location.locationType)}</p>
              {person.location.city ? <p>City: {person.location.city}</p> : null}
              {person.location.countyName ? <p>County: {person.location.countyName}</p> : null}
            </>
          ) : (
            <p>No location on file.</p>
          )}
        </Card>
      </Section>

      <Section id="contact" title="Contact">
        <Card>
          <p>
            <strong>Preferred contact method:</strong>{' '}
            {person.preferredContactMethod
              ? label(person.preferredContactMethod)
              : 'Unknown'}
          </p>
          {!person.hasContactMethods ? (
            <p>Direct contact information has not been added for this person.</p>
          ) : (
            <>
              <p>
                <strong>Email:</strong>{' '}
                {person.email ? (
                  person.contactRevealed ? (
                    <a href={`mailto:${person.email}`}>{person.email}</a>
                  ) : (
                    person.email
                  )
                ) : (
                  '—'
                )}
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                {person.phone ? (
                  person.contactRevealed ? (
                    <a href={`sms:${person.phone}`}>{person.phone}</a>
                  ) : (
                    person.phone
                  )
                ) : (
                  '—'
                )}
              </p>
              {!person.contactRevealed ? (
                <p className="field__hint">
                  Contact details are masked. Unlock the Leader Board to reveal full values.
                </p>
              ) : null}
            </>
          )}
        </Card>
      </Section>
    </div>
  )
}
