import { useState, type FormEvent } from 'react'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button, Field, Input, Select, Textarea } from '@/components/ui'
import { TEAMS } from '@/content/ayc'
import { submitBetaFeedback } from '@/features/feedback/feedbackApi'
import '../landing/landing.css'
import './join.css'

const TEAM_OPTIONS = [
  ...TEAMS.map((team) => ({ value: team.id, label: team.name })),
  { value: 'graphic-design', label: 'Graphic Design (with Social Media)' },
  { value: 'unsure', label: 'Not sure yet' },
]

export function JoinPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [locationType, setLocationType] = useState('COLLEGE')
  const [locationName, setLocationName] = useState('')
  const [teamInterest, setTeamInterest] = useState('organizer')
  const [leadInterest, setLeadInterest] = useState('volunteer')
  const [notes, setNotes] = useState('')
  const [ageOk, setAgeOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [referenceCode, setReferenceCode] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!ageOk) {
      setError('Please confirm you are between 16 and 24 (or seeking an approved path).')
      return
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.')
      return
    }

    setBusy(true)
    try {
      const description = [
        'JOIN APPLICATION',
        `Name: ${firstName.trim()} ${lastName.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim() || 'not provided'}`,
        `City/area: ${city.trim() || 'not provided'}`,
        `Path: ${locationType}`,
        `School/campus/county: ${locationName.trim() || 'not provided'}`,
        `Team interest: ${teamInterest}`,
        `Leadership interest: ${leadInterest}`,
        `Notes: ${notes.trim() || 'none'}`,
      ].join('\n')

      const result = await submitBetaFeedback({
        category: 'IDEA',
        description,
        pagePath: '/join',
        workflow: 'JOIN_APPLICATION',
        reporterName: `${firstName.trim()} ${lastName.trim()}`,
        reporterContact: [email.trim(), phone.trim()].filter(Boolean).join(' · '),
        browserContext: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 240) : null,
      })

      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setReferenceCode(result.data.referenceCode)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (referenceCode) {
    return (
      <div className="join-page">
        <DocumentMeta
          title="Application received | Arkansas Youth Coalition"
          description="Thanks for joining AYC."
        />
        <p className="landing__eyebrow">You are in the queue</p>
        <h1>Thank you for joining AYC.</h1>
        <p className="page-header__lede">
          Your application reference is <strong>{referenceCode}</strong>. Chance and the leadership
          team will follow up. Keep building where you are — we will meet you there.
        </p>
        <div className="btn-row">
          <Button to="/" variant="primary">
            Back to home
          </Button>
          <Button to="/directory" variant="secondary">
            Explore the directory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="join-page">
      <DocumentMeta
        title="Join AYC | Arkansas Youth Coalition"
        description="Join the Arkansas Youth Coalition — volunteer or lead on a statewide civic leadership team."
      />
      <p className="landing__eyebrow">Join AYC</p>
      <h1>Join the Arkansas Youth Coalition</h1>
      <p className="page-header__lede">
        Tell us about yourself, pick a team, and say whether you want to volunteer or lead. This is
        how we grow the network across colleges, high schools, and working-class communities.
      </p>

      <div className="join-layout">
        <aside className="join-explain card">
          <h2>Positions explained</h2>
          <ul>
            {TEAMS.map((team) => (
              <li key={team.id}>
                <strong>{team.name}</strong> — {team.description}
              </li>
            ))}
            <li>
              <strong>Graphic Design</strong> — one statewide design group under Social Media, with
              one Graphic Design lead.
            </li>
          </ul>
          <h3>Leadership interest</h3>
          <p>
            You can volunteer on a team, offer to lead a team in your area, or express interest in a
            statewide category lead seat as those seats are named.
          </p>
        </aside>

        <form className="card join-form" onSubmit={onSubmit}>
          {error ? (
            <div className="error-state" role="alert">
              {error}
            </div>
          ) : null}

          <div className="join-form__row">
            <Field id="join-first" label="First name">
              <Input
                id="join-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Field>
            <Field id="join-last" label="Last name">
              <Input
                id="join-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Field>
          </div>

          <Field id="join-email" label="Email">
            <Input
              id="join-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field id="join-phone" label="Phone (optional)">
            <Input id="join-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field id="join-city" label="City / area">
            <Input id="join-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>

          <Field id="join-path" label="Where are you based?">
            <Select
              id="join-path"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
            >
              <option value="COLLEGE">College / university</option>
              <option value="HIGH_SCHOOL">High school</option>
              <option value="WORKING_CLASS">Working class / county (non-student)</option>
              <option value="UNSURE">Not sure yet</option>
            </Select>
          </Field>

          <Field id="join-location" label="School, campus, or county name">
            <Input
              id="join-location"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. UAPB, Central High, Pulaski County"
            />
          </Field>

          <Field id="join-team" label="Team interest">
            <Select
              id="join-team"
              value={teamInterest}
              onChange={(e) => setTeamInterest(e.target.value)}
            >
              {TEAM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="join-lead" label="How do you want to contribute?">
            <Select
              id="join-lead"
              value={leadInterest}
              onChange={(e) => setLeadInterest(e.target.value)}
            >
              <option value="volunteer">Volunteer on a team</option>
              <option value="local-lead">Interested in leading a team in my area</option>
              <option value="category-lead">Interested in a statewide category lead seat</option>
            </Select>
          </Field>

          <Field id="join-notes" label="Anything else we should know?">
            <Textarea
              id="join-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Experience, availability, why AYC…"
            />
          </Field>

          <label className="join-check">
            <input
              type="checkbox"
              checked={ageOk}
              onChange={(e) => setAgeOk(e.target.checked)}
            />
            <span>I am ages 16–24 (or I am seeking an approved leadership path with AYC).</span>
          </label>

          <div className="btn-row">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit join application'}
            </Button>
            <Button to="/" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
