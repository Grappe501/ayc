import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { PageHeader, Section } from '@/components/ui'
import {
  createContact,
  fetchLocations,
  fetchTeams,
  type ApiError,
} from '@/features/leader/leaderApi'
import { DuplicateReviewPanel } from '@/features/leader/DuplicateReviewPanel'
import { NewLocationDialog } from '@/features/leader/NewLocationDialog'

type LocationType = 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY'
type LocationOption = {
  id: string
  locationType: string
  code: string
  compositeCode: string
  name: string
}

type TeamOption = { id: string; name: string }

const AFFILIATION: Record<LocationType, 'CURRENT_COLLEGE' | 'CURRENT_SCHOOL' | 'COUNTY_RESIDENCE'> =
  {
    COLLEGE: 'CURRENT_COLLEGE',
    HIGH_SCHOOL: 'CURRENT_SCHOOL',
    COUNTY: 'COUNTY_RESIDENCE',
  }

type Props = {
  onSavedAnother?: () => void
}

export function ContactForm({ onSavedAnother }: Props) {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [loadError, setLoadError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [preferredName, setPreferredName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('UNKNOWN')
  const [locationType, setLocationType] = useState<LocationType>('COLLEGE')
  const [locationQuery, setLocationQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null)
  const [primaryTeamId, setPrimaryTeamId] = useState('')
  const [additionalTeamIds, setAdditionalTeamIds] = useState<string[]>([])
  const [position, setPosition] = useState<'LEAD' | 'VOLUNTEER'>('VOLUNTEER')
  const [status, setStatus] = useState<'ACTIVE' | 'PROSPECTIVE' | 'INACTIVE'>('ACTIVE')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [duplicateError, setDuplicateError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState<{ personId: string; displayName: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [teamsResult, locationsResult] = await Promise.all([
        fetchTeams(),
        fetchLocations(),
      ])
      if (cancelled) return
      if (!teamsResult.ok || !locationsResult.ok) {
        setLoadError(
          (!teamsResult.ok && teamsResult.error.message) ||
            (!locationsResult.ok && locationsResult.error.message) ||
            'Could not load form options.',
        )
        return
      }
      setTeams(teamsResult.data)
      setLocations(locationsResult.data)
      if (teamsResult.data[0]) setPrimaryTeamId(teamsResult.data[0].id)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase()
    return locations
      .filter((loc) => loc.locationType === locationType)
      .filter((loc) => {
        if (!q) return true
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.code.toLowerCase().includes(q) ||
          loc.compositeCode.toLowerCase().includes(q)
        )
      })
      .slice(0, 8)
  }, [locations, locationType, locationQuery])

  const missingContact = !email.trim() && !phone.trim()
  const primaryTeamName = teams.find((t) => t.id === primaryTeamId)?.name ?? '—'

  function resetForm() {
    setFirstName('')
    setPreferredName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setPreferredContactMethod('UNKNOWN')
    setLocationQuery('')
    setSelectedLocation(null)
    setAdditionalTeamIds([])
    setPosition('VOLUNTEER')
    setStatus('ACTIVE')
    setFormError('')
    setFieldErrors({})
    setDuplicateError(null)
    setSuccess(null)
  }

  function buildPayload(opts?: {
    confirmDuplicate?: boolean
    forceCreateDespiteExact?: boolean
  }) {
    if (!selectedLocation) return null
    return {
      firstName,
      preferredName: preferredName || null,
      lastName,
      email: email || null,
      phone: phone || null,
      preferredContactMethod,
      status,
      source: 'LEADER_ENTRY',
      location: {
        id: selectedLocation.id,
        locationType,
        name: selectedLocation.name,
        code: selectedLocation.code,
      },
      affiliationType: AFFILIATION[locationType],
      primaryTeamId,
      additionalTeamIds,
      position,
      confirmDuplicate: opts?.confirmDuplicate,
      forceCreateDespiteExact: opts?.forceCreateDespiteExact,
    }
  }

  async function submit(opts?: {
    confirmDuplicate?: boolean
    forceCreateDespiteExact?: boolean
    addAnother?: boolean
  }) {
    setFormError('')
    setFieldErrors({})
    setDuplicateError(null)

    if (!selectedLocation) {
      setFormError('Search for and select a location, or create a new one.')
      return
    }
    if (missingContact && status !== 'PROSPECTIVE') {
      setFormError(
        'This contact does not have an email address or phone number. Set status to Prospective to continue, or add a contact method.',
      )
      return
    }

    const payload = buildPayload(opts)
    if (!payload) return

    setBusy(true)
    try {
      const result = await createContact(payload)
      if (!result.ok) {
        if (result.error.code === 'DUPLICATE_CONTACT') {
          setDuplicateError(result.error)
          return
        }
        if (result.error.fields) setFieldErrors(result.error.fields)
        setFormError(result.error.message)
        return
      }

      if (opts?.addAnother) {
        resetForm()
        onSavedAnother?.()
        return
      }
      setSuccess({ personId: result.data.personId, displayName: result.data.displayName })
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    await submit()
  }

  if (success) {
    return (
      <div>
        <PageHeader
          eyebrow="Contact Added"
          title="Contact Added"
          lede={`${success.displayName} is now part of the AYC leadership directory.`}
        />
        <div className="btn-row">
          <Button to={`/leader/contacts/${success.personId}`} variant="primary">
            View Contact
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm()
            }}
          >
            Add Another Contact
          </Button>
          <Button to="/leader" variant="secondary">
            Return to Leader Board
          </Button>
        </div>
      </div>
    )
  }

  if (duplicateError) {
    return (
      <DuplicateReviewPanel
        error={duplicateError}
        draft={{
          firstName,
          lastName,
          email,
          phone,
          locationLabel: selectedLocation
            ? `${selectedLocation.code} · ${selectedLocation.name}`
            : '—',
          teamLabel: `${primaryTeamName} · ${position === 'LEAD' ? 'Lead' : 'Volunteer'}`,
        }}
        onUseExisting={(personId) => navigate(`/leader/contacts/${personId}`)}
        onCreateDifferent={() =>
          void submit({
            confirmDuplicate: true,
            forceCreateDespiteExact: duplicateError.duplicateResult === 'EXACT_MATCH',
          })
        }
        onReturn={() => setDuplicateError(null)}
      />
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Add Contact"
        title="Add a Contact"
        lede="Add a leader or volunteer to the statewide AYC directory. You can update this information later."
      />

      {loadError ? (
        <div className="error-state" role="alert">
          {loadError}
        </div>
      ) : null}

      <form onSubmit={onSubmit}>
        {formError ? (
          <div className="error-state" role="alert">
            {formError}
          </div>
        ) : null}

        {missingContact ? (
          <div className="error-state" role="status">
            This contact does not have an email address or phone number. You may continue with
            Prospective status, but AYC will not have a direct way to reach them.
          </div>
        ) : null}

        <Section id="person" title="Person">
          <div className="card">
            <Field id="firstName" label="First name *" hint={fieldErrors.firstName}>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field
              id="preferredName"
              label="Preferred name"
              hint="Preferred name is optional and will be used in the directory when provided."
            >
              <Input
                id="preferredName"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
            </Field>
            <Field id="lastName" label="Last name *" hint={fieldErrors.lastName}>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Field>
          </div>
        </Section>

        <Section id="contact" title="Contact">
          <div className="card">
            <Field id="email" label="Email address" hint={fieldErrors.email}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field id="phone" label="Mobile or text number" hint={fieldErrors.phone}>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field id="preferredContactMethod" label="Preferred contact method">
              <Select
                id="preferredContactMethod"
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value)}
              >
                <option value="TEXT">Text</option>
                <option value="EMAIL">Email</option>
                <option value="EITHER">Either</option>
                <option value="UNKNOWN">Unknown</option>
              </Select>
            </Field>
          </div>
        </Section>

        <Section id="location" title="Location">
          <div className="card">
            <Field id="locationType" label="Location type *">
              <Select
                id="locationType"
                value={locationType}
                onChange={(e) => {
                  setLocationType(e.target.value as LocationType)
                  setSelectedLocation(null)
                }}
              >
                <option value="COLLEGE">College</option>
                <option value="HIGH_SCHOOL">High School</option>
                <option value="COUNTY">County / Non-Student</option>
              </Select>
            </Field>
            <Field id="locationSearch" label="Search for a location *">
              <Input
                id="locationSearch"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Type a name or code"
              />
            </Field>
            {selectedLocation ? (
              <p>
                Selected: <strong>{selectedLocation.code}</strong> · {selectedLocation.name}
              </p>
            ) : null}
            <ul className="card-grid" style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0' }}>
              {filteredLocations.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    className="card card--interactive"
                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedLocation(loc)
                      setLocationQuery(loc.name)
                    }}
                  >
                    <strong>{loc.code}</strong>
                    <div>{loc.name}</div>
                    <div className="field__hint">{loc.locationType.replaceAll('_', ' ')}</div>
                  </button>
                </li>
              ))}
            </ul>
            {filteredLocations.length === 0 ? (
              <p className="field__hint">
                No matching location found.
                {locationQuery.trim()
                  ? ` Create “${locationQuery.trim()}” as a new ${locationType === 'COLLEGE' ? 'college' : locationType === 'HIGH_SCHOOL' ? 'high school' : 'county'}.`
                  : ''}
              </p>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(true)}>
              Create New Location
            </Button>
          </div>
        </Section>

        <Section id="team" title="Team and Position">
          <div className="card">
            <Field id="primaryTeam" label="Primary team *">
              <Select
                id="primaryTeam"
                value={primaryTeamId}
                onChange={(e) => {
                  setPrimaryTeamId(e.target.value)
                  setAdditionalTeamIds((ids) => ids.filter((id) => id !== e.target.value))
                }}
                required
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="position" label="Position *">
              <Select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value as 'LEAD' | 'VOLUNTEER')}
              >
                <option value="LEAD">Lead</option>
                <option value="VOLUNTEER">Volunteer</option>
              </Select>
            </Field>
            <fieldset className="field">
              <legend>Additional teams</legend>
              {teams
                .filter((team) => team.id !== primaryTeamId)
                .map((team) => (
                  <label key={team.id} style={{ display: 'block', marginBottom: '0.35rem' }}>
                    <input
                      type="checkbox"
                      checked={additionalTeamIds.includes(team.id)}
                      onChange={(e) => {
                        setAdditionalTeamIds((ids) =>
                          e.target.checked
                            ? [...ids, team.id]
                            : ids.filter((id) => id !== team.id),
                        )
                      }}
                    />{' '}
                    {team.name}
                  </label>
                ))}
            </fieldset>
            <Field id="status" label="Participation status">
              <Select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'ACTIVE' | 'PROSPECTIVE' | 'INACTIVE')
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="PROSPECTIVE">Prospective</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </Field>
          </div>
        </Section>

        {selectedLocation ? (
          <aside className="card" aria-label="Contact summary preview">
            <p className="card__eyebrow">Preview</p>
            <h3>
              {preferredName || firstName || '—'} {lastName || ''}
            </h3>
            <p>
              {selectedLocation.code} · {selectedLocation.name}
            </p>
            <p>
              {primaryTeamName} · {position === 'LEAD' ? 'Lead' : 'Volunteer'}
            </p>
            <p>{status.charAt(0) + status.slice(1).toLowerCase()}</p>
          </aside>
        ) : null}

        <div className="btn-row" style={{ marginTop: '1.25rem' }}>
          <Button type="submit" variant="primary" disabled={busy || Boolean(loadError)}>
            {busy ? 'Saving Contact…' : 'Save Contact'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || Boolean(loadError)}
            onClick={() => void submit({ addAnother: true })}
          >
            Save and Add Another
          </Button>
          <Button to="/leader" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>

      <NewLocationDialog
        open={dialogOpen}
        initialType={locationType}
        initialName={locationQuery}
        onClose={() => setDialogOpen(false)}
        onCreated={(loc) => {
          const option: LocationOption = {
            id: loc.id,
            locationType: loc.locationType,
            code: loc.code,
            compositeCode: loc.compositeCode,
            name: loc.name,
          }
          setLocations((prev) => [...prev, option])
          setLocationType(loc.locationType as LocationType)
          setSelectedLocation(option)
          setLocationQuery(loc.name)
        }}
      />
    </div>
  )
}
