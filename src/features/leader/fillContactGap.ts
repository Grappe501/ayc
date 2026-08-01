import {
  fetchContact,
  updateContact,
  updateContactFlags,
  type ApiError,
  type ContactDetail,
} from '@/features/leader/leaderApi'

type FillResult =
  | { ok: true; contact: ContactDetail; displayName: string }
  | { ok: false; error: ApiError; status: number }

const AFFILIATION = {
  COLLEGE: 'CURRENT_COLLEGE',
  HIGH_SCHOOL: 'CURRENT_SCHOOL',
  COUNTY: 'COUNTY_RESIDENCE',
} as const

function preferredFrom(
  email: string | null,
  phone: string | null,
  preferred?: string | null,
  textReady?: boolean,
) {
  if (preferred === 'TEXT' || preferred === 'EMAIL' || preferred === 'EITHER' || preferred === 'UNKNOWN') {
    if (textReady && preferred === 'EMAIL') return email ? 'EITHER' : 'TEXT'
    if (textReady && preferred === 'UNKNOWN') return email ? 'EITHER' : 'TEXT'
    return preferred
  }
  if (email && phone) return 'EITHER'
  if (phone) return 'TEXT'
  if (email) return 'EMAIL'
  return 'UNKNOWN'
}

/** Load a contact and patch only phone/email (keeps name, location, teams). */
export async function fillContactGap(
  personId: string,
  input: {
    email: string
    phone: string
    preferredContactMethod?: string
    textReady?: boolean
  },
): Promise<FillResult> {
  const detail = await fetchContact(personId)
  if (!detail.ok) {
    return { ok: false, error: detail.error, status: detail.status }
  }

  const contact = detail.data
  if (!contact.location) {
    return {
      ok: false,
      status: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Add a location on the full contact form before filling phone/email.',
      },
    }
  }
  if (!contact.primaryTeam) {
    return {
      ok: false,
      status: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Assign a primary team before filling phone/email.',
      },
    }
  }

  const email = input.email.trim() || null
  const phone = input.phone.trim() || null
  if (!email && !phone) {
    return {
      ok: false,
      status: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Enter a phone number, an email address, or both.',
        fields: { email: 'Required if no phone', phone: 'Required if no email' },
      },
    }
  }

  const locationType = contact.location.locationType as keyof typeof AFFILIATION
  const status =
    contact.status === 'ARCHIVED'
      ? 'PROSPECTIVE'
      : (contact.status as 'ACTIVE' | 'PROSPECTIVE' | 'INACTIVE')

  const preferredContactMethod = preferredFrom(
    email,
    phone,
    input.preferredContactMethod,
    input.textReady,
  )

  const result = await updateContact(personId, {
    firstName: contact.firstName,
    middleName: contact.middleName,
    preferredName: contact.preferredName,
    lastName: contact.lastName,
    email,
    phone,
    preferredContactMethod,
    status,
    source: contact.source || 'LEADER_ENTRY',
    location: {
      id: contact.location.id,
      locationType: contact.location.locationType,
      name: contact.location.name,
      code: contact.location.code,
    },
    affiliationType: AFFILIATION[locationType] ?? 'ORGANIZING_LOCATION',
    primaryTeamId: contact.primaryTeam.id,
    additionalTeamIds: contact.additionalTeams.map((team) => team.id),
    position: contact.primaryTeam.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER',
    confirmDuplicate: true,
  })

  if (!result.ok) {
    return { ok: false, error: result.error, status: result.status }
  }

  let updated = result.data.contact
  if (input.textReady && phone) {
    const flags = await updateContactFlags({
      id: personId,
      preferredContactMethod,
      textReady: true,
    })
    if (flags.ok && flags.data.contact) {
      updated = flags.data.contact
    }
  }

  if (!updated) {
    return {
      ok: false,
      status: 500,
      error: { code: 'INTERNAL_ERROR', message: 'Contact saved but could not be reloaded.' },
    }
  }

  return {
    ok: true,
    contact: updated,
    displayName: result.data.displayName,
  }
}
