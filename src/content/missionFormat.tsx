import type { ReactNode } from 'react'
import { AYC_MISSION_HIGHLIGHTS } from './ayc'

/** Split mission into sentences while preserving every character of the original. */
export function splitMissionParagraphs(mission: string): string[] {
  const parts = mission.split(/(?<=\.)\s+(?=[A-Z])/)
  return parts.length > 1 ? parts : [mission]
}

/**
 * Emphasize approved phrases without altering mission wording.
 * Highlights must be exact substrings of the source text.
 */
export function emphasizeMissionText(text: string, highlights = AYC_MISSION_HIGHLIGHTS): ReactNode[] {
  const sorted = [...highlights].sort((a, b) => b.length - a.length)
  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    let earliest = -1
    let match = ''
    for (const phrase of sorted) {
      const idx = remaining.indexOf(phrase)
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx
        match = phrase
      }
    }

    if (earliest === -1 || !match) {
      nodes.push(remaining)
      break
    }

    if (earliest > 0) {
      nodes.push(remaining.slice(0, earliest))
    }
    nodes.push(
      <strong key={`h-${key++}`} className="mission-highlight">
        {match}
      </strong>,
    )
    remaining = remaining.slice(earliest + match.length)
  }

  return nodes
}
