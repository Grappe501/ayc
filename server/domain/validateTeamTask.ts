import {
  TEAM_TASK_PRIORITIES,
  TEAM_TASK_STATUSES,
  type TeamTaskPriority,
  type TeamTaskStatus,
} from './enums.ts'

export type TeamTaskInput = {
  title?: string | null
  notes?: string | null
  status?: string | null
  priority?: string | null
  dueOn?: string | null
}

export type ValidatedTeamTask = {
  title: string
  notes: string | null
  status: TeamTaskStatus
  priority: TeamTaskPriority
  dueOn: string | null
}

export type ValidationIssue = { field: string; message: string }

function includes<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value)
}

export function validateTeamTaskCreate(input: TeamTaskInput): {
  ok: true
  value: ValidatedTeamTask
} | {
  ok: false
  issues: ValidationIssue[]
} {
  const issues: ValidationIssue[] = []
  const title = input.title?.trim() ?? ''
  if (!title) issues.push({ field: 'title', message: 'Task title is required.' })
  if (title.length > 160) {
    issues.push({ field: 'title', message: 'Keep the title under 160 characters.' })
  }

  const notes = input.notes?.trim() || null
  if (notes && notes.length > 2000) {
    issues.push({ field: 'notes', message: 'Keep notes under 2,000 characters.' })
  }

  const status = (input.status ?? 'OPEN').trim()
  if (!includes(TEAM_TASK_STATUSES, status)) {
    issues.push({ field: 'status', message: 'Choose Open, Done, or Cancelled.' })
  }

  const priority = (input.priority ?? 'NORMAL').trim()
  if (!includes(TEAM_TASK_PRIORITIES, priority)) {
    issues.push({ field: 'priority', message: 'Choose Normal or High priority.' })
  }

  let dueOn: string | null = null
  if (input.dueOn?.trim()) {
    const raw = input.dueOn.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      issues.push({ field: 'dueOn', message: 'Use YYYY-MM-DD for due dates.' })
    } else {
      dueOn = raw
    }
  }

  if (issues.length > 0) return { ok: false, issues }

  return {
    ok: true,
    value: {
      title,
      notes,
      status: status as TeamTaskStatus,
      priority: priority as TeamTaskPriority,
      dueOn,
    },
  }
}
