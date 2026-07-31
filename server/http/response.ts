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

function corsHeaders(): Record<string, string> {
  const origin = process.env.AYC_ALLOWED_ORIGIN?.trim()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Headers'] =
      'Content-Type, Authorization, X-AYC-Leader-Write-Secret'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, OPTIONS'
  }
  return headers
}

export function ok<T>(data: T, statusCode = 200, meta: Record<string, unknown> = {}): HandlerResponse {
  return {
    statusCode,
    headers: corsHeaders(),
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
    headers: corsHeaders(),
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

export function rateLimited(retryAfterSec: number): HandlerResponse {
  const response = fail(
    'RATE_LIMITED',
    'Too many requests. Please wait a moment and try again.',
    429,
  )
  return {
    ...response,
    headers: {
      ...response.headers,
      'Retry-After': String(retryAfterSec),
    },
  }
}
