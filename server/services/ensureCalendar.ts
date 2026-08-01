import { eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import { boards, calendars } from '../db/schema.ts'

export async function ensureCalendarForBoard(
  db: AycDatabase,
  boardId: string,
  boardName: string,
) {
  const [existing] = await db
    .select()
    .from(calendars)
    .where(eq(calendars.boardId, boardId))
    .limit(1)
  if (existing) return existing

  const [created] = await db
    .insert(calendars)
    .values({
      boardId,
      name: `${boardName} Calendar`,
      kind: 'BOARD',
    })
    .returning()
  return created!
}

export async function ensureCalendarsForAllBoards(db: AycDatabase): Promise<number> {
  const rows = await db
    .select({ id: boards.id, name: boards.name })
    .from(boards)
    .where(isNull(boards.archivedAt))
  let created = 0
  for (const row of rows) {
    const before = await db
      .select({ id: calendars.id })
      .from(calendars)
      .where(eq(calendars.boardId, row.id))
      .limit(1)
    if (before.length === 0) {
      await ensureCalendarForBoard(db, row.id, row.name)
      created += 1
    }
  }
  return created
}
