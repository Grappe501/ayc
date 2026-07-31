import type { Handler } from '@netlify/functions'
import { verifyUnlockCode } from '../../server/http/auth.ts'
import { fail, ok, parseJsonBody } from '../../server/http/response.ts'

type Body = { code?: string }

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return fail('VALIDATION_ERROR', 'Use POST.', 405)
  }

  const body = parseJsonBody<Body>(event.body)
  const code = body?.code?.trim() ?? ''
  const result = verifyUnlockCode(code)

  if (!result.ok) {
    // Same message for misconfigured and wrong code — do not leak config state.
    return fail(
      'UNAUTHORIZED',
      'That access code was not accepted. Please check it and try again.',
      401,
    )
  }

  return ok({ unlocked: true })
}
