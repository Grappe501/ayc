import { useEffect, useState, type FormEvent } from 'react'
import { Button, Field, Input, LoadingState, Section, Select, Tag } from '@/components/ui'
import {
  getTeamResourceStarters,
  type TeamResourceStarter,
} from '@/content/teamResourceStarters'
import {
  createTeamResource,
  fetchTeamResources,
  updateTeamResource,
  type TeamResource,
} from '@/features/leader/leaderApi'
import type { TeamBoardSlug } from '@/features/leader/teamBoards'

type Props = {
  teamSlug: TeamBoardSlug
}

function kindLabel(kind: string) {
  switch (kind) {
    case 'LINK':
      return 'Link'
    case 'NOTE':
      return 'Note'
    case 'TALKING_POINT':
      return 'Talking point'
    case 'CHECKLIST':
      return 'Checklist'
    default:
      return kind
  }
}

export function TeamResourcesPanel({ teamSlug }: Props) {
  const starters = getTeamResourceStarters(teamSlug)
  const [resources, setResources] = useState<TeamResource[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [kind, setKind] = useState('LINK')

  async function load() {
    setLoading(true)
    setError('')
    const result = await fetchTeamResources(teamSlug)
    if (!result.ok) {
      setError(result.error.message)
      setLoading(false)
      return
    }
    setResources(result.data.resources)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const result = await fetchTeamResources(teamSlug)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      setResources(result.data.resources)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [teamSlug])

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await createTeamResource({
      team: teamSlug,
      title,
      url: url.trim() || null,
      notes: notes.trim() || null,
      kind,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setTitle('')
    setUrl('')
    setNotes('')
    setKind('LINK')
    await load()
  }

  async function addStarter(starter: TeamResourceStarter) {
    setBusy(true)
    setError('')
    const result = await createTeamResource({
      team: teamSlug,
      title: starter.title,
      url: starter.url ?? null,
      notes: starter.notes ?? null,
      kind: starter.kind,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    await load()
  }

  async function archive(resource: TeamResource) {
    setBusy(true)
    setError('')
    const result = await updateTeamResource({ id: resource.id, archive: true })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    await load()
  }

  return (
    <Section id="resources" title="Resources">
      <p className="field__hint" style={{ marginBottom: '1rem' }}>
        Lightweight library for this category — links, talking points, notes, and checklists.
        Keep it practical for phone use.
      </p>

      <div className="team-tasks-stats">
        <Tag>{resources.length} active</Tag>
      </div>

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading resources…" /> : null}

      {!loading ? (
        <div className="team-resources">
          <form className="team-tasks__compose" onSubmit={onCreate}>
            <Field id={`resource-title-${teamSlug}`} label="Title">
              <Input
                id={`resource-title-${teamSlug}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What should leads find here?"
                required
              />
            </Field>
            <Field id={`resource-kind-${teamSlug}`} label="Kind">
              <Select
                id={`resource-kind-${teamSlug}`}
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="LINK">Link</option>
                <option value="TALKING_POINT">Talking point</option>
                <option value="NOTE">Note</option>
                <option value="CHECKLIST">Checklist</option>
              </Select>
            </Field>
            <Field id={`resource-url-${teamSlug}`} label="URL (required for links)">
              <Input
                id={`resource-url-${teamSlug}`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://… or /join"
              />
            </Field>
            <Field id={`resource-notes-${teamSlug}`} label="Notes">
              <Input
                id={`resource-notes-${teamSlug}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Short context or talking-point text"
              />
            </Field>
            <div className="btn-row">
              <Button type="submit" variant="primary" disabled={busy || !title.trim()}>
                {busy ? 'Saving…' : 'Add resource'}
              </Button>
            </div>
          </form>

          {resources.length === 0 ? (
            <div className="team-tasks__empty">
              <p>No resources yet. Add one, or start from these suggestions:</p>
              <ul className="team-resources__starters">
                {starters.map((starter) => (
                  <li key={starter.title}>
                    <div>
                      <Tag>{kindLabel(starter.kind)}</Tag>
                      <strong>{starter.title}</strong>
                      {starter.notes ? <p className="field__hint">{starter.notes}</p> : null}
                      {starter.url ? <p className="field__hint">{starter.url}</p> : null}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void addStarter(starter)}
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="team-resources__list">
              {resources.map((resource) => (
                <li key={resource.id} className="team-resources__item">
                  <div>
                    <div className="team-resources__item-top">
                      <Tag>{kindLabel(resource.kind)}</Tag>
                      <strong>{resource.title}</strong>
                    </div>
                    {resource.url ? (
                      <p>
                        {resource.url.startsWith('/') ? (
                          <a href={resource.url}>{resource.url}</a>
                        ) : (
                          <a href={resource.url} target="_blank" rel="noreferrer">
                            {resource.url}
                          </a>
                        )}
                      </p>
                    ) : null}
                    {resource.notes ? <p className="field__hint">{resource.notes}</p> : null}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void archive(resource)}
                  >
                    Archive
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </Section>
  )
}
