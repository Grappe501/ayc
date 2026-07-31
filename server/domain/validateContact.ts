import {
  AFFILIATION_TYPES,
  ASSIGNMENT_STATUSES,
  LOCATION_TYPES,
  PERSON_SOURCES,
  PERSON_STATUSES,
  PREFERRED_CONTACT_METHODS,
  TEAM_POSITIONS,
  type AffiliationType,
  type LocationType,
  type PersonSource,
  type PersonStatus,
  type PreferredContactMethod,
  type TeamPosition,
} from './enums.ts'
import { isValidLocationCode, toCompositeCode } from './locationCodes.ts'
import {
  deriveDisplayName,
  isPlausibleEmail,
  isPlausiblePhone,
  normalizeEmail,
  normalizeLocationName,
  normalizePhone,
} from './normalize.ts'

export type ContactCreateInput = {
  firstName: string
  lastName: string
  middleName?: string | null
  preferredName?: string | null
  status?: PersonStatus
  source?: PersonSource
  email?: string | null
  phone?: string | null
  preferredContactMethod?: PreferredContactMethod | null
  location: {
    id?: string
    locationType: LocationType
    name: string
    code: string
    shortName?: string | null
    city?: string | null
    countyName?: string | null
  }
  affiliationType: AffiliationType
  primaryTeamId: string
  additionalTeamIds?: string[]
  position: TeamPosition
}

export type ValidatedContactCreate = {
  person: {
    firstName: string
    middleName: string | null
    lastName: string
    preferredName: string | null
    displayName: string
    status: PersonStatus
    source: PersonSource
    preferredContactMethod: PreferredContactMethod
  }
  email: { value: string; normalized: string } | null
  phone: { value: string; normalized: string } | null
  location: {
    id?: string
    locationType: LocationType
    name: string
    normalizedName: string
    code: string
    compositeCode: string
    shortName: string | null
    city: string | null
    countyName: string | null
    state: string
  }
  affiliationType: AffiliationType
  primaryTeamId: string
  additionalTeamIds: string[]
  position: TeamPosition
  assignmentStatus: (typeof ASSIGNMENT_STATUSES)[number]
}

export type ValidationIssue = { field: string; message: string }

function includes<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value)
}

export function validateContactCreate(input: ContactCreateInput): {
  ok: true
  value: ValidatedContactCreate
} | {
  ok: false
  issues: ValidationIssue[]
} {
  const issues: ValidationIssue[] = []

  const firstName = input.firstName?.trim() ?? ''
  const lastName = input.lastName?.trim() ?? ''
  if (!firstName) issues.push({ field: 'firstName', message: 'First name is required.' })
  if (!lastName) issues.push({ field: 'lastName', message: 'Last name is required.' })

  const status = input.status ?? 'ACTIVE'
  if (!includes(PERSON_STATUSES, status)) {
    issues.push({ field: 'status', message: 'Invalid person status.' })
  }

  const source = input.source ?? 'LEADER_ENTRY'
  if (!includes(PERSON_SOURCES, source)) {
    issues.push({ field: 'source', message: 'Invalid person source.' })
  }

  const preferredContactMethod = input.preferredContactMethod ?? 'UNKNOWN'
  if (!includes(PREFERRED_CONTACT_METHODS, preferredContactMethod)) {
    issues.push({
      field: 'preferredContactMethod',
      message: 'Invalid preferred contact method.',
    })
  }

  let email: ValidatedContactCreate['email'] = null
  if (input.email?.trim()) {
    const value = input.email.trim()
    if (!isPlausibleEmail(value)) {
      issues.push({ field: 'email', message: 'Email format looks invalid.' })
    } else {
      email = { value, normalized: normalizeEmail(value) }
    }
  }

  let phone: ValidatedContactCreate['phone'] = null
  if (input.phone?.trim()) {
    const value = input.phone.trim()
    if (!isPlausiblePhone(value)) {
      issues.push({ field: 'phone', message: 'Phone must be a valid 10-digit US number.' })
    } else {
      phone = { value, normalized: normalizePhone(value) }
    }
  }

  if (!email && !phone && status !== 'PROSPECTIVE') {
    issues.push({
      field: 'contact',
      message:
        'Provide an email or phone, or set participation status to Prospective when neither is available.',
    })
  }

  if (!includes(LOCATION_TYPES, input.location.locationType)) {
    issues.push({ field: 'location.locationType', message: 'Invalid location type.' })
  }

  const locationName = input.location.name?.trim() ?? ''
  if (!locationName) {
    issues.push({ field: 'location.name', message: 'Location name is required.' })
  }

  const code = (input.location.code ?? '').trim().toUpperCase()
  if (!isValidLocationCode(code)) {
    issues.push({
      field: 'location.code',
      message: 'Location code must be exactly three uppercase letters.',
    })
  }

  if (!includes(AFFILIATION_TYPES, input.affiliationType)) {
    issues.push({ field: 'affiliationType', message: 'Invalid affiliation type.' })
  }

  if (!input.primaryTeamId?.trim()) {
    issues.push({ field: 'primaryTeamId', message: 'Primary team is required.' })
  }

  if (!includes(TEAM_POSITIONS, input.position)) {
    issues.push({ field: 'position', message: 'Invalid team position.' })
  }

  const additionalTeamIds = [...new Set((input.additionalTeamIds ?? []).filter(Boolean))]
  if (additionalTeamIds.includes(input.primaryTeamId)) {
    issues.push({
      field: 'additionalTeamIds',
      message: 'Additional teams must not repeat the primary team.',
    })
  }

  if (issues.length > 0) return { ok: false, issues }

  const preferredName = input.preferredName?.trim() || null
  const middleName = input.middleName?.trim() || null

  return {
    ok: true,
    value: {
      person: {
        firstName,
        middleName,
        lastName,
        preferredName,
        displayName: deriveDisplayName({ firstName, lastName, preferredName }),
        status,
        source,
        preferredContactMethod,
      },
      email,
      phone,
      location: {
        id: input.location.id,
        locationType: input.location.locationType,
        name: locationName,
        normalizedName: normalizeLocationName(locationName),
        code,
        compositeCode: toCompositeCode(input.location.locationType, code),
        shortName: input.location.shortName?.trim() || null,
        city: input.location.city?.trim() || null,
        countyName: input.location.countyName?.trim() || null,
        state: 'AR',
      },
      affiliationType: input.affiliationType,
      primaryTeamId: input.primaryTeamId.trim(),
      additionalTeamIds,
      position: input.position,
      assignmentStatus: 'ACTIVE',
    },
  }
}
