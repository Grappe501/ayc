import type { AycDatabase } from '../db/client.ts'
import type { AffiliationType, LocationType } from '../domain/enums.ts'
import { suggestLocationCode } from '../domain/locationCodes.ts'
import { createContact } from './contactService.ts'
import { addPipelineTags } from './pipelineTagService.ts'
import { createBetaFeedback } from '../repos/feedback.ts'
import { findLocationByTypeAndCode } from '../repos/locations.ts'
import { getTeamBySlug, listActiveTeams } from '../repos/teams.ts'

export type JoinApplicationRequest = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string | null
  city?: string | null
  locationType?: string
  locationName?: string | null
  teamInterest?: string
  leadInterest?: string
  notes?: string | null
  ageConfirmed?: boolean
}

export type JoinApplicationResult = {
  personId: string
  displayName: string
  status: 'PROSPECTIVE'
  teamSlug: string
  teamName: string
  referenceHint: string
  alreadyOnFile?: boolean
}

function mapLocationType(raw: string | undefined): LocationType {
  const value = (raw ?? 'UNSURE').toUpperCase()
  if (value === 'HIGH_SCHOOL') return 'HIGH_SCHOOL'
  if (value === 'WORKING_CLASS' || value === 'COUNTY') return 'COUNTY'
  if (value === 'COLLEGE') return 'COLLEGE'
  return 'COUNTY'
}

function mapAffiliation(locationType: LocationType, rawPath: string | undefined): AffiliationType {
  const value = (rawPath ?? '').toUpperCase()
  if (locationType === 'HIGH_SCHOOL') return 'CURRENT_SCHOOL'
  if (locationType === 'COLLEGE') return 'CURRENT_COLLEGE'
  if (value === 'WORKING_CLASS') return 'NON_STUDENT_COUNTY'
  return 'ORGANIZING_LOCATION'
}

function mapTeamSlug(interest: string | undefined): string {
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

async function resolveUniqueCode(
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

  const pathRaw = input.locationType ?? 'UNSURE'
  const locationType = mapLocationType(pathRaw)
  const locationName =
    input.locationName?.trim() ||
    input.city?.trim() ||
    (locationType === 'COUNTY' ? 'Working Class / County Prospect' : 'Arkansas Prospect Queue')

  const teamSlug = mapTeamSlug(input.teamInterest)
  const team = await getTeamBySlug(db, teamSlug)
  if (!team) {
    const teams = await listActiveTeams(db)
    if (!teams[0]) {
      throw Object.assign(new Error('MISCONFIGURED'), {
        code: 'MISCONFIGURED' as const,
        message: 'Teams are not configured.',
      })
    }
  }
  const primaryTeam = team ?? (await listActiveTeams(db))[0]!

  const code = await resolveUniqueCode(db, locationType, locationName)
  const leadInterest = (input.leadInterest?.trim() || 'volunteer').toLowerCase()
  const notes = input.notes?.trim() || ''

  const actor = {
    actorType: 'SYSTEM' as const,
    actorLabel: 'JOIN_FORM',
  }

  async function tagLeadInterest(personId: string) {
    if (!personId) return
    const tags: string[] = []
    if (leadInterest === 'local-lead' || leadInterest === 'local_lead') {
      tags.push('LOCAL_LEAD_CANDIDATE')
    }
    if (leadInterest === 'category-lead' || leadInterest === 'category_lead') {
      tags.push('CATEGORY_LEAD_CANDIDATE')
    }
    if (tags.length === 0) return
    try {
      await addPipelineTags(db, personId, tags, actor)
    } catch (error) {
      console.error('join lead-interest pipeline tag failed', error)
    }
  }

  const result = await createContact(
    db,
    {
      firstName,
      lastName,
      email,
      phone: input.phone?.trim() || null,
      status: 'PROSPECTIVE',
      source: 'JOIN_FORM',
      preferredContactMethod: input.phone?.trim() ? 'EITHER' : 'EMAIL',
      location: {
        locationType,
        name: locationName,
        code,
        city: input.city?.trim() || null,
        countyName: locationType === 'COUNTY' ? locationName : null,
      },
      affiliationType: mapAffiliation(locationType, pathRaw),
      primaryTeamId: primaryTeam.id,
      position: leadInterest === 'volunteer' ? 'VOLUNTEER' : 'VOLUNTEER',
      confirmDuplicate: true,
    },
    actor,
  )

  if (result.status === 'duplicate_review' && result.result === 'EXACT_MATCH') {
    const match = result.candidates[0]
    await createBetaFeedback(db, {
      category: 'IDEA',
      description: [
        'JOIN APPLICATION (already on file)',
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Matched person: ${match?.id ?? 'unknown'}`,
        `Team interest: ${teamSlug}`,
        `Leadership interest: ${leadInterest}`,
        `Notes: ${notes || 'none'}`,
      ].join('\n'),
      pagePath: '/join',
      workflow: 'JOIN_APPLICATION',
      reporterName: `${firstName} ${lastName}`,
      reporterContact: [email, input.phone?.trim()].filter(Boolean).join(' · '),
    })
    return {
      personId: match?.id ?? '',
      displayName: match ? `${match.firstName} ${match.lastName}` : `${firstName} ${lastName}`,
      status: 'PROSPECTIVE',
      teamSlug: primaryTeam.slug,
      teamName: primaryTeam.name,
      referenceHint: 'ALREADY_ON_FILE',
      alreadyOnFile: true,
    }
  }

  if (result.status === 'duplicate_review') {
    // Retries with force for likely/possible after confirm path failed unexpectedly.
    const forced = await createContact(
      db,
      {
        firstName,
        lastName,
        email,
        phone: input.phone?.trim() || null,
        status: 'PROSPECTIVE',
        source: 'JOIN_FORM',
        preferredContactMethod: input.phone?.trim() ? 'EITHER' : 'EMAIL',
        location: {
          locationType,
          name: locationName,
          code: await resolveUniqueCode(db, locationType, `${locationName} JOIN`),
          city: input.city?.trim() || null,
        },
        affiliationType: mapAffiliation(locationType, pathRaw),
        primaryTeamId: primaryTeam.id,
        position: 'VOLUNTEER',
        forceCreateDespiteExact: true,
        confirmDuplicate: true,
      },
      actor,
    )
    if (forced.status === 'duplicate_review') {
      throw Object.assign(new Error('VALIDATION_ERROR'), {
        code: 'VALIDATION_ERROR' as const,
        fields: {
          email: 'We could not create your record. Please contact AYC leadership.',
        },
      })
    }
    await tagLeadInterest(forced.personId)
    await createBetaFeedback(db, {
      category: 'IDEA',
      description: [
        'JOIN APPLICATION',
        `Person id: ${forced.personId}`,
        `Name: ${forced.displayName}`,
        `Email: ${email}`,
        `Phone: ${input.phone?.trim() || 'not provided'}`,
        `Path: ${pathRaw}`,
        `Location: ${locationName}`,
        `Team: ${primaryTeam.name}`,
        `Leadership interest: ${leadInterest}`,
        `Notes: ${notes || 'none'}`,
      ].join('\n'),
      pagePath: '/join',
      workflow: 'JOIN_APPLICATION',
      reporterName: `${firstName} ${lastName}`,
      reporterContact: [email, input.phone?.trim()].filter(Boolean).join(' · '),
      severity: 'MEDIUM',
    })
    return {
      personId: forced.personId,
      displayName: forced.displayName,
      status: 'PROSPECTIVE',
      teamSlug: primaryTeam.slug,
      teamName: primaryTeam.name,
      referenceHint: forced.personId.slice(0, 8).toUpperCase(),
    }
  }

  await tagLeadInterest(result.personId)
  await createBetaFeedback(db, {
    category: 'IDEA',
    description: [
      'JOIN APPLICATION',
      `Person id: ${result.personId}`,
      `Name: ${result.displayName}`,
      `Email: ${email}`,
      `Phone: ${input.phone?.trim() || 'not provided'}`,
      `Path: ${pathRaw}`,
      `Location: ${locationName}`,
      `Team: ${primaryTeam.name} (${primaryTeam.slug})`,
      `Leadership interest: ${leadInterest}`,
      `Notes: ${notes || 'none'}`,
      '',
      'Appears on Leader Board / team board as PROSPECTIVE (source JOIN_FORM).',
    ].join('\n'),
    pagePath: '/join',
    workflow: 'JOIN_APPLICATION',
    reporterName: `${firstName} ${lastName}`,
    reporterContact: [email, input.phone?.trim()].filter(Boolean).join(' · '),
    severity: 'MEDIUM',
  })

  return {
    personId: result.personId,
    displayName: result.displayName,
    status: 'PROSPECTIVE',
    teamSlug: primaryTeam.slug,
    teamName: primaryTeam.name,
    referenceHint: result.personId.slice(0, 8).toUpperCase(),
  }
}
