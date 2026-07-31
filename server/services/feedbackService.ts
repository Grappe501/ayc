import type { AycDatabase } from '../db/client.ts'
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from '../domain/enums.ts'
import { createBetaFeedback, type CreateFeedbackInput } from '../repos/feedback.ts'

export type SubmitFeedbackRequest = {
  category?: string
  description?: string
  pagePath?: string | null
  workflow?: string | null
  reporterName?: string | null
  reporterContact?: string | null
  browserContext?: string | null
}

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

export function validateFeedbackSubmit(input: SubmitFeedbackRequest): CreateFeedbackInput {
  const fields: Record<string, string> = {}

  const category = input.category?.trim().toUpperCase() ?? ''
  if (!(FEEDBACK_CATEGORIES as readonly string[]).includes(category)) {
    fields.category = 'Choose a feedback category.'
  }

  const description = input.description?.trim() ?? ''
  if (!description) {
    fields.description = 'Tell us what happened or what you need.'
  } else if (description.length < 10) {
    fields.description = 'Please add a bit more detail (at least a short sentence).'
  } else if (description.length > 5000) {
    fields.description = 'Please keep feedback under 5,000 characters.'
  }

  if (Object.keys(fields).length > 0) throw validationError(fields)

  return {
    category: category as FeedbackCategory,
    description,
    pagePath: input.pagePath?.trim() || null,
    workflow: input.workflow?.trim() || null,
    reporterName: input.reporterName?.trim() || null,
    reporterContact: input.reporterContact?.trim() || null,
    browserContext: input.browserContext?.trim() || null,
  }
}

export async function submitFeedback(db: AycDatabase, input: SubmitFeedbackRequest) {
  const validated = validateFeedbackSubmit(input)
  const row = await createBetaFeedback(db, validated)
  return {
    id: row.id,
    referenceCode: row.referenceCode,
    category: row.category,
    status: row.status,
    createdAt: row.createdAt,
  }
}
