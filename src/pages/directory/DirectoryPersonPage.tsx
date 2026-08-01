import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Section,
  Select,
  Tag,
  Textarea,
} from '@/components/ui'
import {
  fetchDirectoryPerson,
  type DirectoryPersonDetail,
  type ProfileNote,
} from '@/features/directory/directoryApi'
import {
  archiveProfileNote,
  createProfileNote,
  updateProfile,
  uploadProfilePhoto,
} from '@/features/directory/profileApi'
import { hasLeaderSession } from '@/features/leader/leaderSession'
import './directory-profile.css'

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ')
}

export function DirectoryPersonPage() {
  const { personId = '' } = useParams()
  const [person, setPerson] = useState<DirectoryPersonDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(false)
  const [hometown, setHometown] = useState('')
  const [major, setMajor] = useState('')
  const [interests, setInterests] = useState('')
  const [narrative, setNarrative] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [noteVisibility, setNoteVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const leader = hasLeaderSession()

  async function reload() {
    const result = await fetchDirectoryPerson(personId)
    if (!result.ok) {
      setError(result.error.message)
      setPerson(null)
      return
    }
    setPerson(result.data)
    setHometown(result.data.profile.hometown ?? '')
    setMajor(result.data.profile.major ?? '')
    setInterests(result.data.profile.interests ?? '')
    setNarrative(result.data.profile.narrative ?? '')
    setError('')
  }

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
        setHometown(result.data.profile.hometown ?? '')
        setMajor(result.data.profile.major ?? '')
        setInterests(result.data.profile.interests ?? '')
        setNarrative(result.data.profile.narrative ?? '')
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

  const canEdit = person.viewer.canEditProfile
  const publicNotes = person.notes.filter((n) => n.visibility === 'PUBLIC')
  const privateNotes = person.notes.filter((n) => n.visibility === 'PRIVATE')

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setToast('')
    const result = await updateProfile(person!.id, {
      hometown,
      major,
      interests,
      narrative,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setToast('Profile saved.')
    setEditing(false)
    await reload()
  }

  async function onPhoto(file: File | null) {
    if (!file) return
    setBusy(true)
    setToast('')
    const result = await uploadProfilePhoto(person!.id, file)
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setToast('Photo updated.')
    await reload()
  }

  async function onNote(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setToast('')
    const result = await createProfileNote(person!.id, noteBody, noteVisibility)
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setNoteBody('')
    setToast('Note posted.')
    await reload()
  }

  async function onArchiveNote(note: ProfileNote) {
    setBusy(true)
    const result = await archiveProfileNote(note.id)
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setToast('Note removed.')
    await reload()
  }

  return (
    <div className="directory-profile">
      <PageHeader
        eyebrow="Directory Profile"
        title={person.displayName}
        lede="Teams, location, and the story this leader shares with AYC."
        actions={
          <>
            <Badge tone={person.status === 'ARCHIVED' ? 'gold' : 'green'}>
              {label(person.status)}
            </Badge>
            <Button to="/directory" variant="secondary">
              Back to Directory
            </Button>
            {leader ? (
              <Button to={`/leader/contacts/${person.id}`} variant="secondary">
                Edit Contact
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setEditing((value) => !value)}
              >
                {editing ? 'Cancel edit' : 'Edit profile'}
              </Button>
            ) : null}
          </>
        }
      />

      {toast ? (
        <div className="success-state" role="status">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      <div className="directory-profile__hero">
        <Section title="Affiliations">
          <Card>
            <ul className="directory-profile__affiliations">
              {person.location ? (
                <li>
                  <Tag>
                    {person.location.code} · {person.location.name}
                  </Tag>
                </li>
              ) : (
                <li>
                  <Tag>No location yet</Tag>
                </li>
              )}
              {person.primaryTeam ? (
                <li>
                  <Tag>
                    {person.primaryTeam.name} ·{' '}
                    {person.primaryTeam.position === 'LEAD' ? 'Lead' : 'Volunteer'}
                  </Tag>
                </li>
              ) : null}
              {person.additionalTeams.map((team) => (
                <li key={team.id}>
                  <Tag>
                    {team.name} · {team.position === 'LEAD' ? 'Lead' : 'Volunteer'}
                  </Tag>
                </li>
              ))}
            </ul>
            {person.location?.city || person.location?.countyName ? (
              <p className="field__hint">
                {[person.location.city, person.location.countyName, label(person.location.locationType)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
            <p className="field__hint">
              Affiliation changes are made by leaders in the contact record.
            </p>
          </Card>
        </Section>

        <div className="directory-profile__photo">
          {person.profile.photoUrl ? (
            <img src={person.profile.photoUrl} alt={`${person.displayName} profile`} />
          ) : (
            <div className="directory-profile__photo-placeholder">No photo yet</div>
          )}
          {canEdit ? (
            <label className="btn btn--secondary">
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={busy}
                onChange={(e) => void onPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : null}
        </div>
      </div>

      <Section title="About">
        <Card>
          {editing ? (
            <form onSubmit={onSaveProfile} className="directory-profile__edit">
              <Field id="pf-hometown" label="Hometown">
                <Input
                  id="pf-hometown"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                />
              </Field>
              <Field id="pf-major" label="Major / focus">
                <Input id="pf-major" value={major} onChange={(e) => setMajor(e.target.value)} />
              </Field>
              <Field id="pf-interests" label="Interests">
                <Input
                  id="pf-interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Organizing, design, voter registration…"
                />
              </Field>
              <Field id="pf-narrative" label="Narrative">
                <Textarea
                  id="pf-narrative"
                  rows={5}
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="What you’re building with AYC, what you care about…"
                />
              </Field>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          ) : (
            <>
              <p>
                <strong>Hometown:</strong> {person.profile.hometown || '—'}
              </p>
              <p>
                <strong>Major / focus:</strong> {person.profile.major || '—'}
              </p>
              <p>
                <strong>Interests:</strong> {person.profile.interests || '—'}
              </p>
              <p>
                <strong>Narrative:</strong>
              </p>
              <p>{person.profile.narrative || 'No narrative yet.'}</p>
            </>
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

      <Section title="Notes">
        <Card>
          {person.viewer.canLeaveNote ? (
            <form onSubmit={onNote} className="directory-profile__edit">
              <Field id="note-body" label="Leave a note">
                <Textarea
                  id="note-body"
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  required
                />
              </Field>
              <Field id="note-vis" label="Visibility">
                <Select
                  id="note-vis"
                  value={noteVisibility}
                  onChange={(e) =>
                    setNoteVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')
                  }
                >
                  <option value="PUBLIC">Public (on this profile)</option>
                  <option value="PRIVATE">Private (owner + leaders)</option>
                </Select>
              </Field>
              <Button type="submit" variant="primary" disabled={busy}>
                Post note
              </Button>
            </form>
          ) : (
            <p className="field__hint">
              <Link to="/login">Log in</Link> to leave a note on this profile.
            </p>
          )}

          <h3 style={{ marginTop: '1.25rem' }}>Public notes</h3>
          {publicNotes.length === 0 ? (
            <p className="field__hint">No public notes yet.</p>
          ) : (
            <ul className="directory-profile__notes">
              {publicNotes.map((note) => (
                <li key={note.id}>
                  <strong>{note.authorDisplayName}</strong>
                  <p className="field__hint">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <p>{note.body}</p>
                  {person.viewer.isOwner ||
                  person.viewer.isLeader ||
                  person.viewer.personId === note.authorPersonId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void onArchiveNote(note)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {(person.viewer.isOwner || person.viewer.isLeader) && privateNotes.length > 0 ? (
            <>
              <h3 style={{ marginTop: '1.25rem' }}>Private notes</h3>
              <ul className="directory-profile__notes">
                {privateNotes.map((note) => (
                  <li key={note.id}>
                    <strong>{note.authorDisplayName}</strong> <Tag>Private</Tag>
                    <p className="field__hint">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    <p>{note.body}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void onArchiveNote(note)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      </Section>
    </div>
  )
}
