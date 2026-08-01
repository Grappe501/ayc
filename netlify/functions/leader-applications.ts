import type { Handler } from '@netlify/functions'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  acceptMembershipApplication,
  declineMembershipApplication,
  getMembershipApplication,
  listMembershipApplications,
  markApplicationReviewing,
} from '../../server/services/applicationService.ts'
import { withLeaderDb } from './_shared.ts'

function serialize(row: NonNullable<Awaited<ReturnType<typeof getMembershipApplication>>>) {
  return {
    id: row.id,
    referenceCode: row.referenceCode,
    status: row.status,
    firstName: row.firstName,
    lastName: row.lastName,
    preferredName: row.preferredName,
    email: row.email,
    phone: row.phone,
    city: row.city,
    county: row.county,
    ageConfirmed: row.ageConfirmed,
    locationInterestType: row.locationInterestType,
    locationNameFreeform: row.locationNameFreeform,
    primaryTeamInterest: row.primaryTeamInterest,
    secondaryInterests: row.secondaryInterests ?? [],
    wantsToLeadLocal: row.wantsToLeadLocal,
    wantsCategoryLead: row.wantsCategoryLead,
    experienceNotes: row.experienceNotes,
    availabilityNotes: row.availabilityNotes,
    howHeard: row.howHeard,
    reviewNotes: row.reviewNotes,
    matchedPersonId: row.matchedPersonId,
    assignedToPersonId: row.assignedToPersonId,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return withLeaderDb(event, async (db) => {
      const params = event.queryStringParameters ?? {}
      try {
        const result = await listMembershipApplications(db, {
          status: params.status ?? undefined,
          q: params.q ?? undefined,
          limit: params.limit ? Number(params.limit) : 100,
        })
        return ok({
          total: result.total,
          openCount: result.openCount,
          items: result.items.map((row) => serialize(row)),
        })
      } catch (error) {
        const err = error as { code?: string; fields?: Record<string, string> }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Check the highlighted fields.', 400, err.fields)
        }
        throw error
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<{
        id?: string
        action?: 'review' | 'accept' | 'decline'
        reviewNotes?: string | null
      }>(event.body)

      if (!body?.id?.trim()) {
        return fail('VALIDATION_ERROR', 'Application id is required.', 400, { id: 'Required' })
      }
      if (!body.action || !['review', 'accept', 'decline'].includes(body.action)) {
        return fail('VALIDATION_ERROR', 'action must be review, accept, or decline.', 400, {
          action: 'Invalid action',
        })
      }

      const actor = {
        actorType: 'SHARED_LEADER_SESSION' as const,
        actorLabel: 'LEAD_ORGANIZER',
        requestId: event.headers['x-nf-request-id'] ?? null,
      }

      try {
        if (body.action === 'review') {
          const row = await markApplicationReviewing(db, body.id, actor, body.reviewNotes)
          return ok({ application: serialize(row) })
        }
        if (body.action === 'decline') {
          const row = await declineMembershipApplication(db, body.id, actor, body.reviewNotes)
          return ok({ application: serialize(row) })
        }
        const result = await acceptMembershipApplication(db, body.id, actor, body.reviewNotes)
        return ok({
          application: serialize(result.application),
          personId: result.personId,
          created: result.created,
        })
      } catch (error) {
        const err = error as {
          code?: string
          message?: string
          fields?: Record<string, string>
        }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
        }
        if (err.code === 'VALIDATION_ERROR') {
          return fail('VALIDATION_ERROR', 'Could not update application.', 400, err.fields)
        }
        if (err.code === 'MISCONFIGURED') {
          return fail('MISCONFIGURED', err.message ?? 'Misconfigured.', 503)
        }
        throw error
      }
    })
  }

  return methodNotAllowed(['GET', 'PATCH'])
}
