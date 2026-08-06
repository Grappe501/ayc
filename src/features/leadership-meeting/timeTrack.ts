import { SLIDES } from './content'
import { meetingPath } from './paths'

/** One-hour track: 55 min weighted content + 5 min initial Q&A. Optional +15 after. */
export const MEETING_CONTENT_MINUTES = 55
export const INITIAL_QA_MINUTES = 5
export const MEETING_HOUR_MINUTES = MEETING_CONTENT_MINUTES + INITIAL_QA_MINUTES
export const EXTENDED_QA_MINUTES = 15
export const TOTAL_WITH_EXTENDED_MINUTES = MEETING_HOUR_MINUTES + EXTENDED_QA_MINUTES

export type TimeSegment = {
  id: string
  label: string
  minutes: number
  path: string | null
  speaker?: string
}

/** Aligned to AYC leadership-meeting slides (sum of content = 55). */
export const TIME_SEGMENTS: TimeSegment[] = [
  { id: 'welcome', label: 'Welcome', minutes: 3, path: meetingPath('/'), speaker: 'Chance' },
  { id: 'why', label: 'Why We’re Here', minutes: 4, path: meetingPath('/why'), speaker: 'Xay' },
  { id: 'vision', label: 'AYC Vision', minutes: 6, path: meetingPath('/vision'), speaker: 'Chance' },
  {
    id: 'elections',
    label: 'Election & Citizen Power',
    minutes: 6,
    path: meetingPath('/elections'),
    speaker: 'Marlena',
  },
  {
    id: 'operation',
    label: 'Operation Arkansas',
    minutes: 5,
    path: meetingPath('/operation-arkansas'),
    speaker: 'Maverick',
  },
  {
    id: 'events',
    label: 'Social Event Model',
    minutes: 5,
    path: meetingPath('/events'),
    speaker: 'Marlena',
  },
  {
    id: 'tollette',
    label: 'Tollette',
    minutes: 4,
    path: meetingPath('/tollette'),
    speaker: 'Keithan & Tyler',
  },
  {
    id: 'teams',
    label: 'Five Local Teams',
    minutes: 6,
    path: meetingPath('/teams'),
    speaker: 'Keithan & Maverick',
  },
  {
    id: 'strike',
    label: 'Strike Teams',
    minutes: 4,
    path: meetingPath('/strike-teams'),
    speaker: 'Xavion',
  },
  {
    id: 'calendar',
    label: 'This Weekend',
    minutes: 5,
    path: meetingPath('/calendar'),
    speaker: 'Madison',
  },
  { id: 'close', label: 'Close & Q/A', minutes: 7, path: meetingPath('/close'), speaker: 'Chance' },
  { id: 'qa', label: 'Initial Q&A', minutes: INITIAL_QA_MINUTES, path: null, speaker: 'All' },
  {
    id: 'qa-extended',
    label: 'Optional extended Q&A',
    minutes: EXTENDED_QA_MINUTES,
    path: null,
    speaker: 'All',
  },
]

const CONTENT_SEGMENTS = TIME_SEGMENTS.filter((s) => s.path !== null)

export function assertTimeTrack(): void {
  const contentSum = CONTENT_SEGMENTS.reduce((n, s) => n + s.minutes, 0)
  if (contentSum !== MEETING_CONTENT_MINUTES) {
    console.warn(`Time track content minutes sum to ${contentSum}, expected ${MEETING_CONTENT_MINUTES}`)
  }
}

export function segmentForPath(pathname: string): TimeSegment | undefined {
  return CONTENT_SEGMENTS.find((s) => s.path === pathname)
}

export function cumulativeStartMinutes(segmentId: string): number {
  let t = 0
  for (const s of TIME_SEGMENTS) {
    if (s.id === segmentId) return t
    t += s.minutes
  }
  return t
}

export function formatClock(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : ''
  const abs = Math.abs(totalSeconds)
  const m = Math.floor(abs / 60)
  const s = abs % 60
  return `${sign}${m}:${s.toString().padStart(2, '0')}`
}

export const STORAGE_START = 'ayc-leadership-meeting-start-ms'

export function getMeetingStart(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_START)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function setMeetingStart(ms: number | null): void {
  try {
    if (ms == null) localStorage.removeItem(STORAGE_START)
    else localStorage.setItem(STORAGE_START, String(ms))
  } catch {
    /* ignore */
  }
}

export type ClockPhase =
  | { kind: 'segment'; segment: TimeSegment; segmentRemainingSec: number; hourRemainingSec: number }
  | { kind: 'initial-qa'; remainingSec: number; hourRemainingSec: number }
  | { kind: 'extended-qa'; remainingSec: number }
  | { kind: 'complete' }

export function clockPhaseAt(elapsedSec: number, pathname: string): ClockPhase {
  const hourTotalSec = MEETING_HOUR_MINUTES * 60
  const contentSec = MEETING_CONTENT_MINUTES * 60
  const extendedEnd = TOTAL_WITH_EXTENDED_MINUTES * 60

  if (elapsedSec >= extendedEnd) return { kind: 'complete' }

  if (elapsedSec >= hourTotalSec) {
    return {
      kind: 'extended-qa',
      remainingSec: extendedEnd - elapsedSec,
    }
  }

  if (elapsedSec >= contentSec) {
    return {
      kind: 'initial-qa',
      remainingSec: hourTotalSec - elapsedSec,
      hourRemainingSec: hourTotalSec - elapsedSec,
    }
  }

  const byPath = segmentForPath(pathname)
  let segment = byPath
  if (!segment) {
    let acc = 0
    for (const s of CONTENT_SEGMENTS) {
      const end = acc + s.minutes * 60
      if (elapsedSec < end) {
        segment = s
        break
      }
      acc = end
    }
    segment = segment ?? CONTENT_SEGMENTS[CONTENT_SEGMENTS.length - 1]
  }

  const startMin = cumulativeStartMinutes(segment.id)
  const segmentElapsed = elapsedSec - startMin * 60
  const segmentRemainingSec = segment.minutes * 60 - segmentElapsed

  return {
    kind: 'segment',
    segment,
    segmentRemainingSec,
    hourRemainingSec: hourTotalSec - elapsedSec,
  }
}

export function timeTrackSummary(): { id: string; label: string; minutes: number; speaker?: string }[] {
  return TIME_SEGMENTS.filter((s) => s.id !== 'qa-extended').map((s) => ({
    id: s.id,
    label: s.label,
    minutes: s.minutes,
    speaker: s.speaker,
  }))
}

export function slideIdsInTimeOrder(): string[] {
  return CONTENT_SEGMENTS.map((s) => s.id).filter((id) => SLIDES.some((sl) => sl.id === id))
}
