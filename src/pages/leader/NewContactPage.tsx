import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { hasLeaderSession } from '@/features/leader/LeaderAccessGate'
import { TEAMS } from '@/content/ayc'
import { isValidLocationCode, suggestLocationCode, toCompositeCode } from '@/utils/locationCode'
import '@/components/ui/ui.css'

type LocationType = 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY'

export function NewContactPage() {
  const unlocked = hasLeaderSession()
  const [firstName, setFirstName] = useState('')
  const [preferredName, setPreferredName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredMethod, setPreferredMethod] = useState('UNKNOWN')
  const [locationType, setLocationType] = useState<LocationType>('COLLEGE')
  const [locationName, setLocationName] = useState('')
  const [locationCode, setLocationCode] = useState('')
  const [primaryTeam, setPrimaryTeam] = useState('organizer')
  const [position, setPosition] = useState('VOLUNTEER')
  const [status, setStatus] = useState('ACTIVE')
  const [message, setMessage] = useState('')

  const composite = useMemo(() => {
    if (!isValidLocationCode(locationCode)) return ''
    return toCompositeCode(locationType, locationCode)
  }, [locationCode, locationType])

  if (!unlocked) {
    return <Navigate to="/leader" replace />
  }

  function onLocationNameBlur() {
    if (!locationCode && locationName.trim()) {
      setLocationCode(suggestLocationCode(locationName))
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !locationName.trim() || !primaryTeam || !position) {
      setMessage('Please review the highlighted fields.')
      return
    }
    if (!email.trim() && !phone.trim()) {
      setMessage(
        'This contact does not have an email address or phone number. You may continue later when persistence ships; AYC will not have a direct way to reach them.',
      )
    }
    setMessage(
      'Contact form is ready. Saving to PostgreSQL ships with Phase 1C/1D. Your entries stayed on screen.',
    )
  }

  return (
    <div>
      <p className="page-eyebrow">Leader Board</p>
      <h1>Add a Contact</h1>
      <p className="page-lede">Add a leader or volunteer to the statewide AYC directory.</p>
      <p className="field__hint" style={{ color: 'var(--color-light-gray)' }}>
        You can update this information later.
      </p>

      <form className="surface form-stack" onSubmit={onSubmit}>
        {message ? (
          <div className="alert alert--on-light" role="status">
            {message}
          </div>
        ) : null}

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>
            <h2 style={{ fontSize: '1.5rem' }}>1. Person</h2>
          </legend>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="firstName">First name *</label>
              <input
                id="firstName"
                autoComplete="given-name"
                required
                maxLength={100}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="preferredName">Preferred name</label>
              <input
                id="preferredName"
                maxLength={100}
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
              <p className="field__hint">
                Preferred name is optional and will be used in the directory when provided.
              </p>
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name *</label>
              <input
                id="lastName"
                autoComplete="family-name"
                required
                maxLength={100}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>
            <h2 style={{ fontSize: '1.5rem' }}>2. Contact</h2>
          </legend>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Mobile or text number</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="preferredMethod">Preferred contact method</label>
              <select
                id="preferredMethod"
                value={preferredMethod}
                onChange={(e) => setPreferredMethod(e.target.value)}
              >
                <option value="TEXT">Text</option>
                <option value="EMAIL">Email</option>
                <option value="EITHER">Either</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>
            <h2 style={{ fontSize: '1.5rem' }}>3. Location</h2>
          </legend>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="locationType">Location type *</label>
              <select
                id="locationType"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationType)}
              >
                <option value="COLLEGE">College</option>
                <option value="HIGH_SCHOOL">High School</option>
                <option value="COUNTY">County / Non-Student</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="locationName">Official location name *</label>
              <input
                id="locationName"
                required
                maxLength={200}
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onBlur={onLocationNameBlur}
              />
            </div>
            <div className="field">
              <label htmlFor="locationCode">Three-letter code *</label>
              <input
                id="locationCode"
                required
                maxLength={3}
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value.toUpperCase())}
              />
              <p className="field__hint">
                Every AYC location receives a memorable three-letter code. The code must be unique
                within its location type.
                {composite ? ` System code: ${composite}` : ''}
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>
            <h2 style={{ fontSize: '1.5rem' }}>4. Team and Position</h2>
          </legend>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="primaryTeam">Primary team *</label>
              <select
                id="primaryTeam"
                value={primaryTeam}
                onChange={(e) => setPrimaryTeam(e.target.value)}
              >
                {TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="position">Position *</label>
              <select id="position" value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="LEAD">Lead</option>
                <option value="VOLUNTEER">Volunteer</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Participation status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="PROSPECTIVE">Prospective</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </fieldset>

        <p className="field__hint">
          This information is used by the Arkansas Youth Coalition leadership team to organize and
          communicate within the protected Workbench.
        </p>

        <div className="btn-row">
          <Button type="submit" variant="primary">
            Save Contact
          </Button>
          <Button to="/leader" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/leader">Return to Leader Board</Link>
      </p>
    </div>
  )
}
