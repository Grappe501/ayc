import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { teamResources, teams } from '../db/schema.ts'
import {
  validateTeamResourceCreate,
  type TeamResourceInput,
} from '../domain/validateTeamResource.ts'
import { insertAuditEvent } from '../repos/audit.ts'
import type { ActorContext } from '../repos/people.ts'
import { getTeamBySlug } from '../repos/teams.ts'

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

export type TeamResourceRow = {
  id: string
  teamId: string
  teamSlug: string
  title: string
  url: string | null
  notes: string | null
  kind: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

function mapResource(
  row: typeof teamResources.$inferSelect,
  teamSlug: string,
): TeamResourceRow {
  return {
    id: row.id,
    teamId: row.teamId,
    teamSlug,
    title: row.title,
    url: row.url,
    notes: row.notes,
    kind: row.kind,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listTeamResources(
  db: AycDatabase,
  teamSlug: string,
): Promise<{
  team: { id: string; slug: string; name: string }
  total: number
  resources: TeamResourceRow[]
}> {
  const team = await getTeamBySlug(db, teamSlug)
  if (!team || !team.active) throw notFound('Team board was not found.')

  const rows = await db
    .select()
    .from(teamResources)
    .where(and(eq(teamResources.teamId, team.id), isNull(teamResources.archivedAt)))
    .orderBy(asc(teamResources.sortOrder), desc(teamResources.createdAt))
    .limit(100)

  return {
    team: { id: team.id, slug: team.slug, name: team.name },
    total: rows.length,
    resources: rows.map((row) => mapResource(row, team.slug)),
  }
}

export async function createTeamResource(
  db: AycDatabase,
  teamSlug: string,
  input: TeamResourceInput,
  actor: ActorContext,
): Promise<TeamResourceRow> {
  const team = await getTeamBySlug(db, teamSlug)
  if (!team || !team.active) throw notFound('Team board was not found.')

  const validated = validateTeamResourceCreate(input)
  if (!validated.ok) {
    throw validationError(
      Object.fromEntries(validated.issues.map((issue) => [issue.field, issue.message])),
    )
  }

  const [created] = await db
    .insert(teamResources)
    .values({
      teamId: team.id,
      title: validated.value.title,
      url: validated.value.url,
      notes: validated.value.notes,
      kind: validated.value.kind,
      createdByActor: actor.actorLabel ?? actor.actorType,
      updatedByActor: actor.actorLabel ?? actor.actorType,
    })
    .returning()

  await insertAuditEvent(db, {
    eventType: 'TEAM_RESOURCE_CREATED',
    entityType: 'TEAM_RESOURCE',
    entityId: created.id,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Added resource “${created.title}” on ${team.name}.`,
    metadata: { teamId: team.id, teamSlug: team.slug, kind: created.kind },
    requestId: actor.requestId,
  })

  return mapResource(created, team.slug)
}

export async function updateTeamResource(
  db: AycDatabase,
  resourceId: string,
  input: TeamResourceInput & { archive?: boolean },
  actor: ActorContext,
): Promise<TeamResourceRow> {
  const [existing] = await db
    .select({
      resource: teamResources,
      teamSlug: teams.slug,
      teamName: teams.name,
    })
    .from(teamResources)
    .innerJoin(teams, eq(teams.id, teamResources.teamId))
    .where(and(eq(teamResources.id, resourceId), isNull(teamResources.archivedAt)))
    .limit(1)

  if (!existing) throw notFound('Resource was not found.')

  if (input.archive) {
    const [archived] = await db
      .update(teamResources)
      .set({
        archivedAt: new Date(),
        updatedAt: new Date(),
        updatedByActor: actor.actorLabel ?? actor.actorType,
      })
      .where(eq(teamResources.id, resourceId))
      .returning()

    await insertAuditEvent(db, {
      eventType: 'TEAM_RESOURCE_ARCHIVED',
      entityType: 'TEAM_RESOURCE',
      entityId: archived.id,
      actorType: actor.actorType,
      actorId: actor.actorId,
      actorLabel: actor.actorLabel,
      changeSummary: `Archived resource “${archived.title}” on ${existing.teamName}.`,
      metadata: { teamSlug: existing.teamSlug },
      requestId: actor.requestId,
    })

    return mapResource(archived, existing.teamSlug)
  }

  const validated = validateTeamResourceCreate({
    title: input.title ?? existing.resource.title,
    url: input.url === undefined ? existing.resource.url : input.url,
    notes: input.notes === undefined ? existing.resource.notes : input.notes,
    kind: input.kind ?? existing.resource.kind,
  })
  if (!validated.ok) {
    throw validationError(
      Object.fromEntries(validated.issues.map((issue) => [issue.field, issue.message])),
    )
  }

  const [updated] = await db
    .update(teamResources)
    .set({
      title: validated.value.title,
      url: validated.value.url,
      notes: validated.value.notes,
      kind: validated.value.kind,
      updatedAt: new Date(),
      updatedByActor: actor.actorLabel ?? actor.actorType,
    })
    .where(eq(teamResources.id, resourceId))
    .returning()

  await insertAuditEvent(db, {
    eventType: 'TEAM_RESOURCE_UPDATED',
    entityType: 'TEAM_RESOURCE',
    entityId: updated.id,
    actorType: actor.actorType,
    actorId: actor.actorId,
    actorLabel: actor.actorLabel,
    changeSummary: `Updated resource “${updated.title}” on ${existing.teamName}.`,
    metadata: { teamSlug: existing.teamSlug, kind: updated.kind },
    requestId: actor.requestId,
  })

  return mapResource(updated, existing.teamSlug)
}
