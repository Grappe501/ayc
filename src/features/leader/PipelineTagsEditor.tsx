import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { PIPELINE_TAG_OPTIONS } from '@/features/leader/pipelineLabels'
import { setPipelineTags } from '@/features/leader/leaderApi'

type Props = {
  personId: string
  initialTags: string[]
  onSaved?: (tags: string[]) => void
  disabled?: boolean
}

export function PipelineTagsEditor({
  personId,
  initialTags,
  onSaved,
  disabled,
}: Props) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  function toggle(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    )
    setToast('')
    setError('')
  }

  async function save() {
    setBusy(true)
    setError('')
    setToast('')
    const result = await setPipelineTags({ personId, tags })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setTags(result.data.tags)
    setToast('Pipeline tags saved.')
    onSaved?.(result.data.tags)
  }

  return (
    <div className="pipeline-tags-editor">
      <p className="field__hint">
        Mark who is in the leadership pipeline — future leaders, mentoring needs, and readiness.
      </p>
      <div className="pipeline-tags-editor__chips">
        {PIPELINE_TAG_OPTIONS.map((option) => {
          const active = tags.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              className={
                active
                  ? 'pipeline-tag-chip pipeline-tag-chip--active'
                  : 'pipeline-tag-chip'
              }
              disabled={disabled || busy}
              aria-pressed={active}
              onClick={() => toggle(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}
      {toast ? (
        <p className="field__hint" role="status">
          {toast}
        </p>
      ) : null}
      <div className="btn-row">
        <Button type="button" variant="primary" disabled={disabled || busy} onClick={() => void save()}>
          {busy ? 'Saving…' : 'Save pipeline tags'}
        </Button>
      </div>
    </div>
  )
}
