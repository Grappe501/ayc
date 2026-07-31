import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Overlay'
import { createLocation } from '@/features/leader/leaderApi'
import { suggestLocationCode, toCompositeCode } from '@/utils/locationCode'

type LocationType = 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY'

export type CreatedLocation = {
  id: string
  locationType: string
  code: string
  compositeCode: string
  name: string
  shortName: string | null
}

type Props = {
  open: boolean
  initialType: LocationType
  initialName?: string
  onClose: () => void
  onCreated: (location: CreatedLocation) => void
}

export function NewLocationDialog({
  open,
  initialType,
  initialName = '',
  onClose,
  onCreated,
}: Props) {
  const [locationType, setLocationType] = useState<LocationType>(initialType)
  const [name, setName] = useState(initialName)
  const [shortName, setShortName] = useState('')
  const [city, setCity] = useState('')
  const [countyName, setCountyName] = useState('')
  const [code, setCode] = useState('')
  const [codeTouched, setCodeTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setLocationType(initialType)
    setName(initialName)
    setShortName('')
    setCity('')
    setCountyName('')
    setCode(suggestLocationCode(initialName))
    setCodeTouched(false)
    setError('')
  }, [open, initialType, initialName])

  useEffect(() => {
    if (!open || codeTouched) return
    setCode(suggestLocationCode(name))
  }, [name, open, codeTouched])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await createLocation({
        locationType,
        name,
        code: code.toUpperCase(),
        shortName: shortName || undefined,
        city: city || undefined,
        countyName: countyName || undefined,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      onCreated(result.data)
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const composite =
    code.length === 3 ? toCompositeCode(locationType, code.toUpperCase()) : '—'

  return (
    <Modal open={open} title="Create New Location" onClose={onClose}>
      <p className="field__hint">
        Every AYC location receives a memorable three-letter code. The code must be unique within
        its location type.
      </p>
      <form onSubmit={onSubmit}>
        {error ? (
          <div className="error-state" role="alert">
            {error}
          </div>
        ) : null}
        <Field id="loc-type" label="Location type *">
          <Select
            id="loc-type"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as LocationType)}
          >
            <option value="COLLEGE">College</option>
            <option value="HIGH_SCHOOL">High School</option>
            <option value="COUNTY">County / Non-Student</option>
          </Select>
        </Field>
        <Field id="loc-name" label="Official location name *">
          <Input
            id="loc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field id="loc-short" label="Short display name">
          <Input id="loc-short" value={shortName} onChange={(e) => setShortName(e.target.value)} />
        </Field>
        <Field id="loc-city" label="City">
          <Input id="loc-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field id="loc-county" label="County">
          <Input
            id="loc-county"
            value={countyName}
            onChange={(e) => setCountyName(e.target.value)}
          />
        </Field>
        <Field
          id="loc-code"
          label="Suggested three-letter code *"
          hint={`Display code: ${code.toUpperCase() || '—'} · System code: ${composite}`}
        >
          <Input
            id="loc-code"
            value={code}
            maxLength={3}
            onChange={(e) => {
              setCodeTouched(true)
              setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
            }}
            required
          />
        </Field>
        <div className="btn-row">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create Location'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
