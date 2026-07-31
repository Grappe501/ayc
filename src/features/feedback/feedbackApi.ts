export type FeedbackSubmitBody = {
  category: string
  description: string
  pagePath?: string | null
  workflow?: string | null
  reporterName?: string | null
  reporterContact?: string | null
  browserContext?: string | null
}

export type FeedbackSubmitResult = {
  id: string
  referenceCode: string
  category: string
  status: string
  createdAt: string
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; fields?: Record<string, string> }; status: number }

export async function submitBetaFeedback(
  body: FeedbackSubmitBody,
): Promise<ApiResult<FeedbackSubmitResult>> {
  const response = await fetch('/api/beta-feedback', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: FeedbackSubmitResult }
    | { ok: false; error: { message: string; fields?: Record<string, string> } }
    | null

  if (!payload) {
    return {
      ok: false,
      status: response.status,
      error: { message: 'Unexpected server response.' },
    }
  }

  if (!payload.ok) {
    return { ok: false, status: response.status, error: payload.error }
  }

  return { ok: true, data: payload.data }
}
