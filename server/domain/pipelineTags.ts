import {
  PIPELINE_TAG_LABELS,
  PIPELINE_TAGS,
  type PipelineTag,
} from './enums.ts'

export function isPipelineTag(value: string): value is PipelineTag {
  return (PIPELINE_TAGS as readonly string[]).includes(value)
}

export function pipelineTagLabel(tag: string): string {
  if (isPipelineTag(tag)) return PIPELINE_TAG_LABELS[tag]
  return tag
}

export function listPipelineTagOptions(): Array<{ value: PipelineTag; label: string }> {
  return PIPELINE_TAGS.map((value) => ({
    value,
    label: PIPELINE_TAG_LABELS[value],
  }))
}
