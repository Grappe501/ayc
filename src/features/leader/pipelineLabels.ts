export const PIPELINE_TAG_OPTIONS = [
  { value: 'FUTURE_LEADER', label: 'Future leader' },
  { value: 'NEEDS_MENTORING', label: 'Needs mentoring' },
  { value: 'READY_TO_LEAD', label: 'Ready to lead' },
  { value: 'LOCAL_LEAD_CANDIDATE', label: 'Local lead candidate' },
  { value: 'CATEGORY_LEAD_CANDIDATE', label: 'Category lead candidate' },
] as const

export function pipelineTagLabel(tag: string): string {
  return PIPELINE_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag
}
