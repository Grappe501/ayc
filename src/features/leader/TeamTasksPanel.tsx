import { useEffect, useState, type FormEvent } from 'react'
import { Button, Field, Input, LoadingState, Section, Select, Tag } from '@/components/ui'
import { getTeamMission } from '@/content/teamMissions'
import {
  createTeamTask,
  fetchTeamTasks,
  updateTeamTask,
  type TeamTask,
} from '@/features/leader/leaderApi'
import type { TeamBoardSlug } from '@/features/leader/teamBoards'

type Props = {
  teamSlug: TeamBoardSlug
}

export function TeamTasksPanel({ teamSlug }: Props) {
  const mission = getTeamMission(teamSlug)
  const [tasks, setTasks] = useState<TeamTask[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [highCount, setHighCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [showDone, setShowDone] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    const result = await fetchTeamTasks(teamSlug)
    if (!result.ok) {
      setError(result.error.message)
      setLoading(false)
      return
    }
    setTasks(result.data.tasks)
    setOpenCount(result.data.openCount)
    setHighCount(result.data.highCount)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const result = await fetchTeamTasks(teamSlug)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      setTasks(result.data.tasks)
      setOpenCount(result.data.openCount)
      setHighCount(result.data.highCount)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [teamSlug])

  const openTasks = tasks.filter((task) => task.status === 'OPEN')
  const doneTasks = tasks.filter((task) => task.status === 'DONE')

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await createTeamTask({
      team: teamSlug,
      title,
      notes: notes.trim() || null,
      priority,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setTitle('')
    setNotes('')
    setPriority('NORMAL')
    await load()
  }

  async function setStatus(task: TeamTask, status: 'OPEN' | 'DONE' | 'CANCELLED') {
    setBusy(true)
    setError('')
    const result = await updateTeamTask({
      id: task.id,
      title: task.title,
      notes: task.notes,
      priority: task.priority,
      dueOn: task.dueOn,
      status,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    await load()
  }

  async function quickAdd(focus: string) {
    setBusy(true)
    setError('')
    const result = await createTeamTask({
      team: teamSlug,
      title: focus,
      priority: 'NORMAL',
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    await load()
  }

  return (
    <Section id="tasks" title="Tasks">
      <p className="field__hint" style={{ marginBottom: '1rem' }}>
        Lightweight team checklist for this category board. Mark done when finished — full
        project management stays out of scope.
      </p>

      <div className="team-tasks-stats">
        <Tag>{openCount} open</Tag>
        {highCount > 0 ? <Tag>{highCount} high priority</Tag> : null}
        <Tag>{doneTasks.length} done shown</Tag>
      </div>

      {error ? (
        <div className="error-state" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading tasks…" /> : null}

      {!loading ? (
        <div className="team-tasks">
          <form className="team-tasks__compose" onSubmit={onCreate}>
            <Field id={`task-title-${teamSlug}`} label="New task">
              <Input
                id={`task-title-${teamSlug}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What should this team do next?"
                required
              />
            </Field>
            <Field id={`task-notes-${teamSlug}`} label="Notes (optional)">
              <Input
                id={`task-notes-${teamSlug}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context for the lead or volunteers"
              />
            </Field>
            <Field id={`task-priority-${teamSlug}`} label="Priority">
              <Select
                id={`task-priority-${teamSlug}`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </Select>
            </Field>
            <div className="btn-row">
              <Button type="submit" variant="primary" disabled={busy || !title.trim()}>
                {busy ? 'Saving…' : 'Add task'}
              </Button>
            </div>
          </form>

          {openTasks.length === 0 ? (
            <div className="team-tasks__empty">
              <p>No open tasks yet. Add one, or start from a focus area:</p>
              <div className="btn-row">
                {mission.focusAreas.slice(0, 3).map((focus) => (
                  <Button
                    key={focus}
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void quickAdd(focus)}
                  >
                    {focus}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="team-tasks__list">
              {openTasks.map((task) => (
                <li
                  key={task.id}
                  className={
                    task.priority === 'HIGH'
                      ? 'team-tasks__item team-tasks__item--high'
                      : 'team-tasks__item'
                  }
                >
                  <label className="team-tasks__check">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled={busy}
                      onChange={() => void setStatus(task, 'DONE')}
                      aria-label={`Mark “${task.title}” done`}
                    />
                    <span>
                      <strong>{task.title}</strong>
                      {task.priority === 'HIGH' ? (
                        <span className="team-tasks__priority">High</span>
                      ) : null}
                      {task.notes ? <span className="field__hint">{task.notes}</span> : null}
                      {task.dueOn ? (
                        <span className="field__hint">Due {task.dueOn}</span>
                      ) : null}
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void setStatus(task, 'CANCELLED')}
                  >
                    Cancel
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {doneTasks.length > 0 ? (
            <div className="team-tasks__done">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDone((value) => !value)}
              >
                {showDone ? 'Hide completed' : `Show completed (${doneTasks.length})`}
              </Button>
              {showDone ? (
                <ul className="team-tasks__list team-tasks__list--done">
                  {doneTasks.map((task) => (
                    <li key={task.id} className="team-tasks__item team-tasks__item--done">
                      <label className="team-tasks__check">
                        <input
                          type="checkbox"
                          checked
                          disabled={busy}
                          onChange={() => void setStatus(task, 'OPEN')}
                          aria-label={`Reopen “${task.title}”`}
                        />
                        <span>
                          <strong>{task.title}</strong>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Section>
  )
}
