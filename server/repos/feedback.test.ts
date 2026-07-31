import { describe, expect, it } from 'vitest'
import { buildReferenceCode } from './feedback.ts'
import { validateFeedbackSubmit } from '../services/feedbackService.ts'

describe('buildReferenceCode', () => {
  it('uses AYC-FB-###### format', () => {
    expect(buildReferenceCode(128)).toMatch(/^AYC-FB-\d{6}$/)
  })
})

describe('validateFeedbackSubmit', () => {
  it('accepts a complete submission', () => {
    const value = validateFeedbackSubmit({
      category: 'IDEA',
      description: 'It would help to sort the directory by county.',
      pagePath: '/directory',
    })
    expect(value.category).toBe('IDEA')
    expect(value.pagePath).toBe('/directory')
  })

  it('requires category and description', () => {
    expect(() => validateFeedbackSubmit({ category: '', description: '' })).toThrow()
  })
})
