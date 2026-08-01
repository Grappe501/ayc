import { describe, expect, it } from 'vitest'
import { PIPELINE_TAGS } from './enums.ts'
import { isPipelineTag, listPipelineTagOptions, pipelineTagLabel } from './pipelineTags.ts'

describe('pipeline tags', () => {
  it('exposes five controlled tags', () => {
    expect(PIPELINE_TAGS).toHaveLength(5)
    expect(listPipelineTagOptions()).toHaveLength(5)
    expect(isPipelineTag('READY_TO_LEAD')).toBe(true)
    expect(isPipelineTag('RANDOM')).toBe(false)
    expect(pipelineTagLabel('NEEDS_MENTORING')).toBe('Needs mentoring')
  })
})
