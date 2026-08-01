import { TEAM_RESOURCE_KINDS, type TeamResourceKind } from './enums.ts'

export type TeamResourceInput = {
  title?: string | null
  url?: string | null
  notes?: string | null
  kind?: string | null
}

export type ValidatedTeamResource = {
  title: string
  url: string | null
  notes: string | null
  kind: TeamResourceKind
}

export type ValidationIssue = { field: string; message: string }

function includes<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value)
}

function looksLikeUrl(value: string): boolean {
  if (value.startsWith('/')) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateTeamResourceCreate(input: TeamResourceInput): {
  ok: true
  value: ValidatedTeamResource
} | {
  ok: false
  issues: ValidationIssue[]
} {
  const issues: ValidationIssue[] = []
  const title = input.title?.trim() ?? ''
  if (!title) issues.push({ field: 'title', message: 'Resource title is required.' })
  if (title.length > 160) {
    issues.push({ field: 'title', message: 'Keep the title under 160 characters.' })
  }

  const notes = input.notes?.trim() || null
  if (notes && notes.length > 2000) {
    issues.push({ field: 'notes', message: 'Keep notes under 2,000 characters.' })
  }

  const kind = (input.kind ?? 'LINK').trim()
  if (!includes(TEAM_RESOURCE_KINDS, kind)) {
    issues.push({ field: 'kind', message: 'Choose a valid resource kind.' })
  }

  const url = input.url?.trim() || null
  if (kind === 'LINK' && !url) {
    issues.push({ field: 'url', message: 'Links need a URL.' })
  }
  if (url && !looksLikeUrl(url)) {
    issues.push({ field: 'url', message: 'Use an http(s) URL or a site path starting with /.' })
  }
  if (url && url.length > 500) {
    issues.push({ field: 'url', message: 'Keep the URL under 500 characters.' })
  }

  if (kind !== 'LINK' && !url && !notes) {
    issues.push({
      field: 'notes',
      message: 'Add notes (or a URL) so the resource is useful.',
    })
  }

  if (issues.length > 0) return { ok: false, issues }

  return {
    ok: true,
    value: {
      title,
      url,
      notes,
      kind: kind as TeamResourceKind,
    },
  }
}
