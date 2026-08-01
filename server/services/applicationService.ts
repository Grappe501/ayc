import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { membershipApplications } from '../db/schema.ts'
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '../domain/enums.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { getTeamBySlug, listActiveTeams } from '../repos/teams.ts'
import { createContact } from './contactService.ts'
import { addPipelineTags } from './pipelineTagService.ts'
import {
  mapAffiliation,
  mapLocationTypeFromInterest,
  resolveUniqueLocationCode,
} from './joinService.ts'

export type MembershipApplicationRow = typeof membershipApplications.$inferSelect

const TERMINAL = new Set<ApplicationStatus>(['ACCEPTED', 'DECLINED'])

function assertStatus(value: string): ApplicationStatus {
  if (!(APPLICATION_STATUSES as readonly string[]).includes(value)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Invalid status' },
    })
  }
  return value as ApplicationStatus
}

export async function listMembershipApplications(
  db: AycDatabase,
  opts: { status?: string; q?: string; limit?: number } = {},
) {
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 200)
  const status = opts.status ? assertStatus(opts.status) : undefined
  const q = opts.q?.trim()

  const conditions = []
  if (status) conditions.push(eq(membershipApplications.status, status))
  if (q) {
    const pattern = `%${q}%`
    conditions.push(
      or(
        ilike(membershipApplications.referenceCode, pattern),
        ilike(membershipApplications.firstName, pattern),
        ilike(membershipApplications.lastName, pattern),
        ilike(membershipApplications.email, pattern),
        ilike(membershipApplications.city, pattern),
        ilike(membershipApplications.locationNameFreeform, pattern),
        ilike(membershipApplications.primaryTeamInterest, pattern),
      )!,
    )
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const items = await db
    .select()
    .from(membershipApplications)
    .where(where)
    .orderBy(desc(membershipApplications.createdAt))
    .limit(limit)

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(membershipApplications)
  const [openRow] = await db
    .select({ openCount: sql<number>`count(*)::int` })
    .from(membershipApplications)
    .where(
      sql`${membershipApplications.status} in ('NEW', 'REVIEWING', 'DUPLICATE')`,
    )

  return {
    items,
    total: totalRow?.total ?? items.length,
    openCount: openRow?.openCount ?? 0,
  }
}

export async function getMembershipApplication(db: AycDatabase, id: string) {
  const [row] = await db
    .select()
    .from(membershipApplications)
    .where(eq(membershipApplications.id, id))
    .limit(1)
  return row ?? null
}

export async function markApplicationReviewing(
  db: AycDatabase,
  id: string,
  actor: ActorContext,
  reviewNotes?: string | null,
) {
  const existing = await getMembershipApplication(db, id)
  if (!existing) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Application not found.',
    })
  }
  if (TERMINAL.has(existing.status as ApplicationStatus)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Application is already closed.' },
    })
  }

  const [row] = await db
    .update(membershipApplications)
    .set({
      status: existing.status === 'DUPLICATE' ? 'DUPLICATE' : 'REVIEWING',
      reviewNotes: reviewNotes?.trim() || existing.reviewNotes,
      updatedAt: new Date(),
    })
    .where(eq(membershipApplications.id, id))
    .returning()

  await insertAuditEvent(db, {
    eventType: 'APPLICATION_UPDATED',
    entityType: 'MEMBERSHIP_APPLICATION',
    entityId: id,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary: `Application ${existing.referenceCode} marked reviewing.`,
  })

  return row!
}

export async function declineMembershipApplication(
  db: AycDatabase,
  id: string,
  actor: ActorContext,
  reviewNotes?: string | null,
) {
  const existing = await getMembershipApplication(db, id)
  if (!existing) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Application not found.',
    })
  }
  if (TERMINAL.has(existing.status as ApplicationStatus)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Application is already closed.' },
    })
  }

  const [row] = await db
    .update(membershipApplications)
    .set({
      status: 'DECLINED',
      reviewNotes: reviewNotes?.trim() || existing.reviewNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(membershipApplications.id, id))
    .returning()

  await insertAuditEvent(db, {
    eventType: 'APPLICATION_DECLINED',
    entityType: 'MEMBERSHIP_APPLICATION',
    entityId: id,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary: `Application ${existing.referenceCode} declined.`,
  })

  return row!
}

export async function acceptMembershipApplication(
  db: AycDatabase,
  id: string,
  actor: ActorContext,
  reviewNotes?: string | null,
) {
  const existing = await getMembershipApplication(db, id)
  if (!existing) {
    throw Object.assign(new Error('NOT_FOUND'), {
      code: 'NOT_FOUND' as const,
      message: 'Application not found.',
    })
  }
  if (TERMINAL.has(existing.status as ApplicationStatus)) {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: { status: 'Application is already closed.' },
    })
  }

  // Duplicate applications link to the matched person; do not create a second record.
  if (existing.matchedPersonId) {
    const tags: string[] = []
    if (existing.wantsToLeadLocal) tags.push('LOCAL_LEAD_CANDIDATE')
    if (existing.wantsCategoryLead) tags.push('CATEGORY_LEAD_CANDIDATE')
    if (tags.length > 0) {
      try {
        await addPipelineTags(db, existing.matchedPersonId, tags, actor)
      } catch (error) {
        console.error('application accept pipeline tags failed', error)
      }
    }

    const [row] = await db
      .update(membershipApplications)
      .set({
        status: 'ACCEPTED',
        assignedToPersonId: existing.matchedPersonId,
        reviewNotes: reviewNotes?.trim() || existing.reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(membershipApplications.id, id))
      .returning()

    await insertAuditEvent(db, {
      eventType: 'APPLICATION_ACCEPTED',
      entityType: 'MEMBERSHIP_APPLICATION',
      entityId: id,
      actorType: actor.actorType,
      actorLabel: actor.actorLabel,
      changeSummary: `Application ${existing.referenceCode} accepted (linked existing person).`,
      metadata: { personId: existing.matchedPersonId },
    })

    return { application: row!, personId: existing.matchedPersonId, created: false }
  }

  const interest = existing.locationInterestType as
    | 'COLLEGE'
    | 'HIGH_SCHOOL'
    | 'WORKING_CLASS'
    | 'UNSURE'
  const locationType = mapLocationTypeFromInterest(interest)
  const locationName =
    existing.locationNameFreeform?.trim() ||
    existing.city?.trim() ||
    (locationType === 'COUNTY' ? 'Working Class / County Prospect' : 'Arkansas Prospect Queue')

  const team =
    (await getTeamBySlug(db, existing.primaryTeamInterest)) ??
    (await listActiveTeams(db))[0]
  if (!team) {
    throw Object.assign(new Error('MISCONFIGURED'), {
      code: 'MISCONFIGURED' as const,
      message: 'Teams are not configured.',
    })
  }

  const code = await resolveUniqueLocationCode(db, locationType, locationName)
  const result = await createContact(
    db,
    {
      firstName: existing.firstName,
      lastName: existing.lastName,
      preferredName: existing.preferredName,
      email: existing.email,
      phone: existing.phone,
      status: 'PROSPECTIVE',
      source: 'JOIN_FORM',
      preferredContactMethod: existing.phone ? 'EITHER' : 'EMAIL',
      location: {
        locationType,
        name: locationName,
        code,
        city: existing.city,
        countyName:
          interest === 'WORKING_CLASS'
            ? existing.county || locationName
            : existing.county,
      },
      affiliationType: mapAffiliation(locationType, interest),
      primaryTeamId: team.id,
      position: 'VOLUNTEER',
      confirmDuplicate: true,
      forceCreateDespiteExact: true,
    },
    {
      actorType: actor.actorType,
      actorLabel: actor.actorLabel ?? 'LEAD_ORGANIZER',
      requestId: actor.requestId,
    },
  )

  if (result.status === 'duplicate_review') {
    throw Object.assign(new Error('VALIDATION_ERROR'), {
      code: 'VALIDATION_ERROR' as const,
      fields: {
        email: 'Could not create person from application. Resolve duplicates first.',
      },
    })
  }

  const tags: string[] = []
  if (existing.wantsToLeadLocal) tags.push('LOCAL_LEAD_CANDIDATE')
  if (existing.wantsCategoryLead) tags.push('CATEGORY_LEAD_CANDIDATE')
  if (tags.length > 0) {
    try {
      await addPipelineTags(db, result.personId, tags, actor)
    } catch (error) {
      console.error('application accept pipeline tags failed', error)
    }
  }

  const [row] = await db
    .update(membershipApplications)
    .set({
      status: 'ACCEPTED',
      assignedToPersonId: result.personId,
      reviewNotes: reviewNotes?.trim() || existing.reviewNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(membershipApplications.id, id))
    .returning()

  await insertAuditEvent(db, {
    eventType: 'APPLICATION_ACCEPTED',
    entityType: 'MEMBERSHIP_APPLICATION',
    entityId: id,
    actorType: actor.actorType,
    actorLabel: actor.actorLabel,
    changeSummary: `Application ${existing.referenceCode} accepted → person created.`,
    metadata: { personId: result.personId },
  })

  return { application: row!, personId: result.personId, created: true }
}
