import { and, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { membershipApplications, personContactMethods } from '../db/schema.ts'
import type { ApplicationLocationInterest, AffiliationType, LocationType } from '../domain/enums.ts'
import { normalizeEmail, normalizePhone } from '../domain/normalize.ts'
import { suggestLocationCode } from '../domain/locationCodes.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import { findLocationByTypeAndCode } from '../repos/locations.ts'
import { getTeamBySlug, listActiveTeams } from '../repos/teams.ts'

export type JoinApplicationRequest = {
  firstName?: string
  lastName?: string
  preferredName?: string | null
  email?: string
  phone?: string | null
  city?: string | null
  county?: string | null
  locationType?: string
  locationName?: string | null
  teamInterest?: string
  secondaryInterests?: string[] | null
  leadInterest?: string
  notes?: string | null
  availabilityNotes?: string | null
  howHeard?: string | null
  ageConfirmed?: boolean
}

export type JoinApplicationResult = {
  applicationId: string
  referenceCode: string
  status: 'NEW' | 'DUPLICATE'
  teamSlug: string
  teamName: string
  alreadyOnFile?: boolean
}

export function mapLocationInterest(raw: string | undefined): ApplicationLocationInterest {
  const value = (raw ?? 'UNSURE').toUpperCase()
  if (value === 'HIGH_SCHOOL') return 'HIGH_SCHOOL'
  if (value === 'WORKING_CLASS' || value === 'COUNTY') return 'WORKING_CLASS'
  if (value === 'COLLEGE') return 'COLLEGE'
  return 'UNSURE'
}

export function mapLocationTypeFromInterest(
  interest: ApplicationLocationInterest,
): LocationType {
  if (interest === 'HIGH_SCHOOL') return 'HIGH_SCHOOL'
  if (interest === 'COLLEGE') return 'COLLEGE'
  return 'COUNTY'
}

export function mapAffiliation(
  locationType: LocationType,
  interest: ApplicationLocationInterest,
): AffiliationType {
  if (locationType === 'HIGH_SCHOOL') return 'CURRENT_SCHOOL'
  if (locationType === 'COLLEGE') return 'CURRENT_COLLEGE'
  if (interest === 'WORKING_CLASS') return 'NON_STUDENT_COUNTY'
  return 'ORGANIZING_LOCATION'
}

export function mapTeamSlug(interest: string | undefined): string {
  const value = (interest ?? 'unsure').toLowerCase()
  if (
    value === 'organizer' ||
    value === 'voter-registration' ||
    value === 'social-media' ||
    value === 'events' ||
    value === 'outreach' ||
    value === 'graphic-design'
  ) {
    return value
  }
  return 'organizer'
}

export function mapLeadFlags(leadInterest: string | undefined): {
  wantsToLeadLocal: boolean
  wantsCategoryLead: boolean
} {
  const value = (leadInterest?.trim() || 'volunteer').toLowerCase()
  return {
    wantsToLeadLocal: value === 'local-lead' || value === 'local_lead',
    wantsCategoryLead: value === 'category-lead' || value === 'category_lead',
  }
}

export function buildApplicationReferenceCode(
  seed = Math.floor(Math.random() * 1_000_000),
): string {
  const n = Math.abs(seed) % 1_000_000
  return `AYC-JA-${n.toString().padStart(6, '0')}`
}

export async function resolveUniqueLocationCode(
  db: AycDatabase,
  locationType: LocationType,
  name: string,
): Promise<string> {
  let base = suggestLocationCode(name) || 'PRQ'
  if (base.length < 3) base = base.padEnd(3, 'X')
  base = base.slice(0, 4)

  const existing = await findLocationByTypeAndCode(db, locationType, base)
  if (!existing) return base

  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  for (let i = 0; i < alphabet.length; i += 1) {
    const candidate = `${base.slice(0, 3)}${alphabet[i]}`.slice(0, 4)
    const hit = await findLocationByTypeAndCode(db, locationType, candidate)
    if (!hit) return candidate
  }
  return `${base.slice(0, 2)}${Date.now().toString(36).slice(-2)}`.toUpperCase().slice(0, 4)
}

async function findPersonIdByEmail(
  db: AycDatabase,
  emailNormalized: string,
): Promise<string | null> {
  const [row] = await db
    .select({ personId: personContactMethods.personId })
    .from(personContactMethods)
    .where(
      and(
        eq(personContactMethods.contactType, 'EMAIL'),
        eq(personContactMethods.normalizedValue, emailNormalized),
        isNull(personContactMethods.archivedAt),
      ),
    )
    .limit(1)
  return row?.personId ?? null
}

export async function submitJoinApplication(
  db: AycDatabase,
  input: JoinApplicationRequest,
): Promise<JoinApplicationResult> {
  const fields: Record<string, string> = {}
  if (!input.ageConfirmed) {
    fields.ageConfirmed = 'Confirm you are ages 16–24 (or an approved path).'
  }
  const firstName = input.firstName?.trim() ?? ''
  const lastName = input.lastName?.trim() ?? ''
  const email = input.email?.trim() ?? ''
  if (!firstName) fields.firstName = 'Required'
  if (!lastName) fields.lastName = 'Required'
  if (!email) fields.email = 'Required'
  if (Object.keys(fields).length > 0) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields,
    })
  }

  const locationInterest = mapLocationInterest(input.locationType)
  const teamSlug = mapTeamSlug(input.teamInterest)
  const team = await getTeamBySlug(db, teamSlug)
  const teams = team ? null : await listActiveTeams(db)
  const primaryTeam = team ?? teams?.[0]
  if (!primaryTeam) {
    throw Object.assign(new Error('MISCONFIGURED'), {
      code: 'MISCONFIGURED' as const,
      message: 'Teams are not configured.',
    })
  }

  const emailNormalized = normalizeEmail(email)
  const phone = input.phone?.trim() || null
  const phoneNormalized = phone ? normalizePhone(phone) : null
  const leadFlags = mapLeadFlags(input.leadInterest)
  const matchedPersonId = await findPersonIdByEmail(db, emailNormalized)
  const status = matchedPersonId ? ('DUPLICATE' as const) : ('NEW' as const)

  const secondary = (input.secondaryInterests ?? [])
    .map((value) => mapTeamSlug(value))
    .filter((value) => value !== primaryTeam.slug)

  let referenceCode = buildApplicationReferenceCode()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const [row] = await db
        .insert(membershipApplications)
        .values({
          referenceCode,
          status,
          firstName,
          lastName,
          preferredName: input.preferredName?.trim() || null,
          email,
          emailNormalized,
          phone,
          phoneNormalized,
          city: input.city?.trim() || null,
          county: input.county?.trim() || null,
          ageConfirmed: true,
          locationInterestType: locationInterest,
          locationNameFreeform: input.locationName?.trim() || null,
          primaryTeamInterest: primaryTeam.slug,
          secondaryInterests: secondary,
          wantsToLeadLocal: leadFlags.wantsToLeadLocal,
          wantsCategoryLead: leadFlags.wantsCategoryLead,
          experienceNotes: input.notes?.trim() || null,
          availabilityNotes: input.availabilityNotes?.trim() || null,
          howHeard: input.howHeard?.trim() || null,
          matchedPersonId,
        })
        .returning()

      if (!row) throw new Error('Failed to create application')

      await insertAuditEvent(db, {
        eventType: 'APPLICATION_SUBMITTED',
        entityType: 'MEMBERSHIP_APPLICATION',
        entityId: row.id,
        actorType: 'SYSTEM',
        actorLabel: 'JOIN_FORM',
        changeSummary: `Join application ${row.referenceCode} submitted (${status}).`,
        metadata: {
          teamSlug: primaryTeam.slug,
          matchedPersonId,
        },
      })

      return {
        applicationId: row.id,
        referenceCode: row.referenceCode,
        status,
        teamSlug: primaryTeam.slug,
        teamName: primaryTeam.name,
        alreadyOnFile: Boolean(matchedPersonId),
      }
    } catch (error) {
      const err = error as { code?: string; constraint_name?: string; message?: string }
      const uniqueHit =
        err.code === '23505' ||
        String(err.message ?? '').includes('reference_code') ||
        String(err.constraint_name ?? '').includes('reference')
      if (uniqueHit && attempt < 4) {
        referenceCode = buildApplicationReferenceCode()
        continue
      }
      throw error
    }
  }

  throw new Error('Could not allocate application reference code')
}
