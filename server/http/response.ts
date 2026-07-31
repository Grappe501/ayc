import type { HandlerResponse } from '@netlify/functions'

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_CONTACT'
  | 'LOCATION_CODE_CONFLICT'
  | 'DATABASE_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'MISCONFIGURED'

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export function ok<T>(data: T, statusCode = 200, meta: Record<string, unknown> = {}): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify({ ok: true, data, meta }),
  }
}

export function fail(
  code: ApiErrorCode,
  message: string,
  statusCode = 400,
  fields?: Record<string, string>,
  extra?: Record<string, unknown>,
): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      ok: false,
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
        ...(extra ?? {}),
      },
    }),
  }
}

export function parseJsonBody<T>(body: string | null): T | null {
  if (!body) return null
  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}

export function methodNotAllowed(allowed: string[]): HandlerResponse {
  return fail('VALIDATION_ERROR', `Use ${allowed.join(' or ')}.`, 405)
}
