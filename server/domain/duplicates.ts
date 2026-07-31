import type { DuplicateResult } from './enums.ts'
import { normalizeEmail, normalizePersonName, normalizePhone } from './normalize.ts'

export type DuplicateCandidate = {
  id: string
  firstName: string
  lastName: string
  preferredName?: string | null
  status: string
  emails: string[]
  phones: string[]
  primaryLocationId?: string | null
  emailDomains?: string[]
  teamIds?: string[]
}

export type DuplicateProbe = {
  firstName: string
  lastName: string
  preferredName?: string | null
  email?: string | null
  phone?: string | null
  primaryLocationId?: string | null
  teamIds?: string[]
}

export type DuplicateAssessment = {
  result: DuplicateResult
  matchedCandidateIds: string[]
  reasons: string[]
}

function namesMatch(a: DuplicateProbe, b: DuplicateCandidate): boolean {
  const aFirst = normalizePersonName(a.firstName)
  const aLast = normalizePersonName(a.lastName)
  const bFirst = normalizePersonName(b.firstName)
  const bLast = normalizePersonName(b.lastName)
  if (aFirst === bFirst && aLast === bLast) return true

  const aPreferred = a.preferredName ? normalizePersonName(a.preferredName) : ''
  const bPreferred = b.preferredName ? normalizePersonName(b.preferredName) : ''
  if (aPreferred && bPreferred && aPreferred === bPreferred && aLast === bLast) return true
  if (aPreferred && aPreferred === bFirst && aLast === bLast) return true
  if (bPreferred && aFirst === bPreferred && aLast === bLast) return true
  return false
}

function emailDomain(email: string): string {
  const at = email.lastIndexOf('@')
  return at >= 0 ? email.slice(at + 1) : ''
}

/**
 * Pure duplicate scoring — no database I/O.
 * Exact email/phone → EXACT_MATCH; name+location / strong combos → LIKELY/POSSIBLE.
 */
export function assessDuplicates(
  probe: DuplicateProbe,
  candidates: DuplicateCandidate[],
): DuplicateAssessment {
  const reasons: string[] = []
  const matched = new Set<string>()
  let result: DuplicateResult = 'NO_MATCH'

  const probeEmail = probe.email ? normalizeEmail(probe.email) : ''
  const probePhone = probe.phone ? normalizePhone(probe.phone) : ''
  const probeTeams = new Set(probe.teamIds ?? [])

  for (const candidate of candidates) {
    const candidateEmails = candidate.emails.map(normalizeEmail).filter(Boolean)
    const candidatePhones = candidate.phones.map(normalizePhone).filter(Boolean)

    if (probeEmail && candidateEmails.includes(probeEmail)) {
      matched.add(candidate.id)
      reasons.push(`Exact email match with ${candidate.id}`)
      result = 'EXACT_MATCH'
      continue
    }

    if (probePhone && candidatePhones.includes(probePhone)) {
      matched.add(candidate.id)
      reasons.push(`Exact phone match with ${candidate.id}`)
      result = 'EXACT_MATCH'
      continue
    }

    const sameName = namesMatch(probe, candidate)
    if (!sameName) continue

    matched.add(candidate.id)

    if (
      probe.primaryLocationId &&
      candidate.primaryLocationId &&
      probe.primaryLocationId === candidate.primaryLocationId
    ) {
      reasons.push(`Same name and primary location as ${candidate.id}`)
      if (result !== 'EXACT_MATCH') result = 'LIKELY_MATCH'
      continue
    }

    if (candidate.status === 'ARCHIVED') {
      reasons.push(`Same name as archived record ${candidate.id}`)
      if (result === 'NO_MATCH' || result === 'POSSIBLE_MATCH') result = 'LIKELY_MATCH'
      continue
    }

    const probeDomain = probeEmail ? emailDomain(probeEmail) : ''
    const candidateDomains =
      candidate.emailDomains?.length
        ? candidate.emailDomains
        : candidateEmails.map(emailDomain).filter(Boolean)

    const sharedTeam =
      probeTeams.size > 0 &&
      (candidate.teamIds ?? []).some((teamId) => probeTeams.has(teamId))

    if (probeDomain && candidateDomains.includes(probeDomain) && sharedTeam) {
      reasons.push(`Same name, email domain, and team as ${candidate.id}`)
      if (result !== 'EXACT_MATCH') result = 'LIKELY_MATCH'
      continue
    }

    if (probePhone && candidatePhones.some((p) => p.slice(-4) === probePhone.slice(-4))) {
      reasons.push(`Same name and phone suffix as ${candidate.id}`)
      if (result === 'NO_MATCH') result = 'POSSIBLE_MATCH'
      continue
    }

    reasons.push(`Same name as ${candidate.id}`)
    if (result === 'NO_MATCH') result = 'POSSIBLE_MATCH'
  }

  return {
    result,
    matchedCandidateIds: [...matched],
    reasons,
  }
}

export function shouldBlockCreation(result: DuplicateResult): boolean {
  return result === 'EXACT_MATCH'
}

export function requiresConfirmation(result: DuplicateResult): boolean {
  return result === 'LIKELY_MATCH' || result === 'POSSIBLE_MATCH'
}
