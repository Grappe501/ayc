import type { ContactDetail } from '@/features/leader/leaderApi'

type LocationType = 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY'

export type ContactFormInitial = {
  personId: string
  firstName: string
  preferredName?: string | null
  lastName: string
  email?: string | null
  phone?: string | null
  preferredContactMethod?: string | null
  locationType: LocationType
  location: {
    id: string
    locationType: string
    code: string
    compositeCode: string
    name: string
  }
  primaryTeamId: string
  additionalTeamIds: string[]
  position: 'LEAD' | 'VOLUNTEER'
  status: 'ACTIVE' | 'PROSPECTIVE' | 'INACTIVE'
}

export function initialFromDetail(detail: ContactDetail): ContactFormInitial | null {
  if (!detail.location || !detail.primaryTeam) return null
  const locationType = detail.location.locationType as LocationType
  const status =
    detail.status === 'PROSPECTIVE' || detail.status === 'INACTIVE'
      ? detail.status
      : 'ACTIVE'
  return {
    personId: detail.id,
    firstName: detail.firstName,
    preferredName: detail.preferredName,
    lastName: detail.lastName,
    email: detail.email?.value ?? null,
    phone: detail.phone?.value ?? null,
    preferredContactMethod: detail.preferredContactMethod ?? 'UNKNOWN',
    locationType,
    location: {
      id: detail.location.id,
      locationType: detail.location.locationType,
      code: detail.location.code,
      compositeCode: detail.location.compositeCode,
      name: detail.location.name,
    },
    primaryTeamId: detail.primaryTeam.id,
    additionalTeamIds: detail.additionalTeams.map((t) => t.id),
    position: detail.primaryTeam.position === 'LEAD' ? 'LEAD' : 'VOLUNTEER',
    status,
  }
}
