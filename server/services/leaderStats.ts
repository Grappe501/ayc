import { and, count, eq, isNull } from 'drizzle-orm'
import type { AycDatabase } from '../db/client.ts'
import {
  locations,
  people,
  personTeamAssignments,
} from '../db/schema.ts'

export async function getLeaderBoardStats(db: AycDatabase) {
  const [activePeople] = await db
    .select({ value: count() })
    .from(people)
    .where(and(eq(people.status, 'ACTIVE'), isNull(people.archivedAt)))

  const [leads] = await db
    .select({ value: count() })
    .from(personTeamAssignments)
    .where(
      and(
        eq(personTeamAssignments.position, 'LEAD'),
        eq(personTeamAssignments.status, 'ACTIVE'),
      ),
    )

  const [volunteers] = await db
    .select({ value: count() })
    .from(personTeamAssignments)
    .where(
      and(
        eq(personTeamAssignments.position, 'VOLUNTEER'),
        eq(personTeamAssignments.status, 'ACTIVE'),
      ),
    )

  const [locationCount] = await db
    .select({ value: count() })
    .from(locations)
    .where(and(eq(locations.active, true), isNull(locations.archivedAt)))

  return {
    activePeople: activePeople?.value ?? 0,
    leads: leads?.value ?? 0,
    volunteers: volunteers?.value ?? 0,
    locationsRepresented: locationCount?.value ?? 0,
  }
}
