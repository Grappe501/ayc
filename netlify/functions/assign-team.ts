import type { Handler } from '@netlify/functions'
import type { TeamPosition } from '../../server/domain/enums.ts'
import { TEAM_POSITIONS } from '../../server/domain/enums.ts'
import { fail, methodNotAllowed, ok, parseJsonBody } from '../../server/http/response.ts'
import { assignPersonTeams } from '../../server/services/leaderRoster.ts'
import { withLeaderDb } from './_shared.ts'

type Body = {
  personId?: string
  primaryTeamId?: string
  position?: TeamPosition
  additionalTeamIds?: string[]
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST'])
  }

  return withLeaderDb(event, async (db) => {
    const body = parseJsonBody<Body>(event.body)
    if (!body?.personId || !body.primaryTeamId || !body.position) {
      return fail(
        'VALIDATION_ERROR',
        'personId, primaryTeamId, and position are required.',
      )
    }
    if (!(TEAM_POSITIONS as readonly string[]).includes(body.position)) {
      return fail('VALIDATION_ERROR', 'Position must be LEAD or VOLUNTEER.')
    }

    try {
      const row = await assignPersonTeams(
        db,
        body.personId,
        {
          primaryTeamId: body.primaryTeamId,
          position: body.position,
          additionalTeamIds: body.additionalTeamIds,
        },
        {
          actorType: 'SHARED_LEADER_SESSION',
          actorLabel: 'SHARED_LEADER_SESSION',
          requestId: event.headers['x-nf-request-id'] ?? null,
        },
      )
      return ok({ person: row })
    } catch (error) {
      const err = error as {
        code?: string
        message?: string
        fields?: Record<string, string>
      }
      if (err.code === 'NOT_FOUND') {
        return fail('NOT_FOUND', err.message ?? 'Contact not found.', 404)
      }
      if (err.code === 'VALIDATION_ERROR') {
        return fail(
          'VALIDATION_ERROR',
          'Please review the highlighted fields.',
          400,
          err.fields,
        )
      }
      throw error
    }
  })
}
