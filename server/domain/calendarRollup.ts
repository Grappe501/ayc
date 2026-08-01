/**
 * Pure rollup rules for nested calendars (CAL track).
 * Events stay on source boards; parents query descendant sources.
 */

export type BoardRollupRow = {
  id: string
  kind: string
  teamId: string | null
  locationId: string | null
  segment: string | null
  parentBoardId: string | null
}

/** Which board IDs contribute events when viewing `focus` in rollup mode. */
export function boardIdsForRollup(
  focus: BoardRollupRow,
  allBoards: BoardRollupRow[],
): string[] {
  if (focus.kind === 'MAIN') {
    return allBoards.map((board) => board.id)
  }

  if (focus.kind === 'SEGMENT') {
    return allBoards
      .filter(
        (board) =>
          board.id === focus.id ||
          (focus.segment != null && board.segment === focus.segment),
      )
      .map((board) => board.id)
  }

  if (focus.kind === 'STATEWIDE_CATEGORY') {
    return allBoards
      .filter(
        (board) =>
          board.id === focus.id ||
          board.parentBoardId === focus.id ||
          (board.kind === 'LOCATION_CATEGORY' &&
            focus.teamId != null &&
            board.teamId === focus.teamId),
      )
      .map((board) => board.id)
  }

  if (focus.kind === 'SECONDARY') {
    return [focus.id]
  }

  if (focus.kind === 'LOCATION_TEAM') {
    return allBoards
      .filter(
        (board) =>
          board.id === focus.id ||
          (board.kind === 'LOCATION_CATEGORY' &&
            focus.locationId != null &&
            board.locationId === focus.locationId),
      )
      .map((board) => board.id)
  }

  if (focus.kind === 'LOCATION_CATEGORY') {
    return [focus.id]
  }

  return [focus.id]
}
