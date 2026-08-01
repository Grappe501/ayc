import type { Handler } from '@netlify/functions'
import { requireLeaderWriteAccess } from '../../server/http/auth.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import {
  grantLeadershipRole,
  listLeadershipRolesForPerson,
  revokeLeadershipRole,
} from '../../server/services/leadershipRoleService.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  personId?: string
  roleCode?: string
  teamSlug?: string | null
  locationId?: string | null
  segment?: string | null
  isPrimary?: boolean
  id?: string
}

function requireMaster(event: Parameters<Handler>[0]) {
  const auth = requireLeaderWriteAccess(event!)
  if (!auth.ok) return auth
  if (auth.scope.kind !== 'master') {
    return { ok: false as const, reason: 'unauthorized' as const }
  }
  return auth
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return withLeaderDb(event, async (db) => {
      const personId = event.queryStringParameters?.personId?.trim()
      if (!personId) return fail('VALIDATION_ERROR', 'personId is required.')
      const roles = await listLeadershipRolesForPerson(db, personId)
      return ok({ roles })
    })
  }

  if (event.httpMethod === 'POST') {
    const master = requireMaster(event)
    if (!master.ok) {
      return fail(
        'UNAUTHORIZED',
        'Only the Lead Organizer master key can grant leadership roles.',
        401,
      )
    }
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      if (!body?.personId || !body.roleCode) {
        return fail('VALIDATION_ERROR', 'personId and roleCode are required.')
      }
      try {
        const role = await grantLeadershipRole(
          db,
          {
            personId: body.personId,
            roleCode: body.roleCode,
            teamSlug: body.teamSlug,
            locationId: body.locationId,
            segment: body.segment,
            isPrimary: body.isPrimary,
          },
          {
            actorType: 'SHARED_LEADER_SESSION',
            actorLabel: 'LEAD_ORGANIZER',
            requestId: event.headers['x-nf-request-id'] ?? null,
          },
        )
        return ok({ status: 'granted', role }, 201)
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
          return fail('VALIDATION_ERROR', 'Could not grant role.', 400, err.fields)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not grant role.', 500)
      }
    })
  }

  if (event.httpMethod === 'PATCH') {
    const master = requireMaster(event)
    if (!master.ok) {
      return fail(
        'UNAUTHORIZED',
        'Only the Lead Organizer master key can revoke leadership roles.',
        401,
      )
    }
    return withLeaderDb(event, async (db) => {
      const body = parseJsonBody<Body>(event.body)
      if (!body?.id) return fail('VALIDATION_ERROR', 'id is required.')
      try {
        const result = await revokeLeadershipRole(db, body.id, {
          actorType: 'SHARED_LEADER_SESSION',
          actorLabel: 'LEAD_ORGANIZER',
          requestId: event.headers['x-nf-request-id'] ?? null,
        })
        return ok(result)
      } catch (error) {
        const err = error as { code?: string; message?: string }
        if (err.code === 'NOT_FOUND') {
          return fail('NOT_FOUND', err.message ?? 'Not found.', 404)
        }
        console.error(error)
        return fail('INTERNAL_ERROR', 'Could not revoke role.', 500)
      }
    })
  }

  return methodNotAllowed(['GET', 'POST', 'PATCH'])
}
