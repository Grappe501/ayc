import { and, asc, desc, eq, isNull, type SQL } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { teamTasks, teams } from '../db/schema.ts'
import { validateTeamTaskCreate, type TeamTaskInput } from '../domain/validateTeamTask.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import { findLocationById } from '../repos/locations.ts'
import type { ActorContext } from '../repos/people.ts'
import { getTeamBySlug } from '../repos/teams.ts'

function locationFilter(locationId?: string | null): SQL {
  return locationId ? eq(teamTasks.locationId, locationId) : isNull(teamTasks.locationId)
}

function validationError(fields: Record<string, string>): Error {
  return Object.assign(new Error('VALIDATION_ERROR'), {
    code: 'VALIDATION_ERROR' as const,
    fields,
  })
}

function notFound(message: string): Error {
  return Object.assign(new Error('NOT_FOUND'), {
    code: 'NOT_FOUND' as const,
    message,
  })
}

export type TeamTaskRow = {
  id: string
  teamId: string
  teamSlug: string
  locationId: string | null
  title: string
  notes: string | null
  status: string
  priority: string
  dueOn: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

function mapTask(
  row: typeof teamTasks.$inferSelect,
  teamSlug: string,
): TeamTaskRow {
  return {
    id: row.id,
    teamId: row.teamId,
    teamSlug,
    locationId: row.locationId ?? null,
    title: row.title,
    notes: row.notes,
    status: row.status,
    priority: row.priority,
    dueOn: row.dueOn ? String(row.dueOn) : null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  }
}

export async function listTeamTasks(
  db: AycDatabase,
  teamSlug: string,
  locationId?: string | null,
): Promise<{
  team: { id: string; slug: string; name: string }
  locationId: string | null
  openCount: number
  highCount: number
  tasks: TeamTaskRow[]
}> {
  const team = await getTeamBySlug(db, teamSlug)
  if (!team || !team.active) throw notFound('Team board was not found.')

  if (locationId) {
    const location = await findLocationById(db, locationId)
    if (!location) throw notFound('Location was not found.')
  }

  const rows = await db
    .select()
    .from(teamTasks)
    .where(
      and(
        eq(teamTasks.teamId, team.id),
        isNull(teamTasks.archivedAt),
        locationFilter(locationId),
      ),
    )
    .orderBy(
      asc(teamTasks.status),
      desc(teamTasks.priority),
      asc(teamTasks.sortOrder),
      desc(teamTasks.createdAt),
    )
    .limit(100)

  // OPEN first visually: status ASC puts CANCELLED, DONE, OPEN alphabetically — reorder.
  const open = rows.filter((row) => row.status === 'OPEN')
  const done = rows.filter((row) => row.status === 'DONE').slice(0, 8)
  const cancelled = rows.filter((row) => row.status === 'CANCELLED').slice(0, 3)
  const ordered = [...open, ...done, ...cancelled]

  return {
    team: { id: team.id, slug: team.slug, name: team.name },
    locationId: locationId ?? null,
    openCount: open.length,
    highCount: open.filter((row) => row.priority === 'HIGH').length,
    tasks: ordered.map((row) => mapTask(row, team.slug)),
  }
}

export async function createTeamTask(
  db: AycDatabase,
  teamSlug: string,
  input: TeamTaskInput,
  actor: ActorContext,
  locationId?: string | null,
): Promise<TeamTaskRow> {
  const team = await getTeamBySlug(db, teamSlug)
  if (!team || !team.active) throw notFound('Team board was not found.')

  if (locationId) {
    const location = await findLocationById(db, locationId)
    if (!location) throw notFound('Location was not found.')
  }

  const validated = validateTeamTaskCreate({ ...input, status: input.status ?? 'OPEN' })
  if (!validated.ok) {
    throw validationError(
      Object.fromEntries(validated.issues.map((issue) => [issue.field, issue.message])),
    )
  }

  const [created] = await db
    .insert(teamTasks)
    .values({
      teamId: team.id,
      locationId: locationId ?? null,
      title: validated.value.title,
      notes: validated.value.notes,
      status: validated.value.status,
      priority: validated.value.priority,
      dueOn: validated.value.dueOn,
      createdByActor: actor.actorLabel ?? actor.actorType,
      updatedByActor: actor.actorLabel ?? actor.actorType,
      completedAt: validated.value.status === 'DONE' ? new Date() : null,
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'TEAM_TASK_CREATED',
    entityType: 'TEAM_TASK',
    entityId: created.id,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Created task “${created.title}” on ${team.name}.`,
    metadata: {
      teamId: team.id,
      teamSlug: team.slug,
      locationId: locationId ?? null,
      status: created.status,
    },
    requestId: actor.requestId,
  })

  return mapTask(created, team.slug)
}

export async function updateTeamTask(
  db: AycDatabase,
  taskId: string,
  input: TeamTaskInput,
  actor: ActorContext,
): Promise<TeamTaskRow> {
  const [existing] = await db
    .select({
      task: teamTasks,
      teamSlug: teams.slug,
      teamName: teams.name,
    })
    .from(teamTasks)
    .innerJoin(teams, eq(teams.id, teamTasks.teamId))
    .where(and(eq(teamTasks.id, taskId), isNull(teamTasks.archivedAt)))
    .limit(1)

  if (!existing) throw notFound('Task was not found.')

  const validated = validateTeamTaskCreate({
    title: input.title ?? existing.task.title,
    notes: input.notes === undefined ? existing.task.notes : input.notes,
    status: input.status ?? existing.task.status,
    priority: input.priority ?? existing.task.priority,
    dueOn:
      input.dueOn === undefined
        ? existing.task.dueOn
          ? String(existing.task.dueOn)
          : null
        : input.dueOn,
  })
  if (!validated.ok) {
    throw validationError(
      Object.fromEntries(validated.issues.map((issue) => [issue.field, issue.message])),
    )
  }

  const becomingDone =
    validated.value.status === 'DONE' && existing.task.status !== 'DONE'
  const leavingDone =
    validated.value.status !== 'DONE' && existing.task.status === 'DONE'

  const [updated] = await db
    .update(teamTasks)
    .set({
      title: validated.value.title,
      notes: validated.value.notes,
      status: validated.value.status,
      priority: validated.value.priority,
      dueOn: validated.value.dueOn,
      updatedAt: new Date(),
      updatedByActor: actor.actorLabel ?? actor.actorType,
      completedAt: becomingDone
        ? new Date()
        : leavingDone
          ? null
          : existing.task.completedAt,
    })
    .where(eq(teamTasks.id, taskId))
    .returning()

  await insertAuditEvent(db, {
    eventType: becomingDone ? 'TEAM_TASK_COMPLETED' : 'TEAM_TASK_UPDATED',
    entityType: 'TEAM_TASK',
    entityId: updated.id,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: becomingDone
      ? `Completed task “${updated.title}” on ${existing.teamName}.`
      : `Updated task “${updated.title}” on ${existing.teamName}.`,
    metadata: {
      teamSlug: existing.teamSlug,
      status: updated.status,
      previousStatus: existing.task.status,
    },
    requestId: actor.requestId,
  })

  return mapTask(updated, existing.teamSlug)
}
