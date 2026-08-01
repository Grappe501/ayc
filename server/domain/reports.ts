/**
 * Phase 2H — pure helpers for Lead Organizer reports.
 */

export type LocationCoverageInput = {
  id: string
  code: string
  name: string
  locationType: string
  hasLocationLeadRole: boolean
  rosterCount: number
  localLeadCandidates: number
  readyToLead: number
  categoryLeadsOnRoster: number
}

export type LocationCoverageRow = LocationCoverageInput & {
  thinPipeline: boolean
  thinFormalLead: boolean
  thin: boolean
}

/** Thin = no formal LOCATION_LEAD role, or no local-lead / ready pipeline at the location. */
export function buildLocationCoverage(
  locations: LocationCoverageInput[],
): LocationCoverageRow[] {
  return locations
    .map((location) => {
      const thinPipeline =
        location.rosterCount === 0 ||
        location.localLeadCandidates + location.readyToLead === 0
      const thinFormalLead = !location.hasLocationLeadRole
      return {
        ...location,
        thinPipeline,
        thinFormalLead,
        thin: thinFormalLead || thinPipeline,
      }
    })
    .sort((a, b) => {
      if (a.thin !== b.thin) return a.thin ? -1 : 1
      if (a.thinFormalLead !== b.thinFormalLead) return a.thinFormalLead ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}

export type ApplicationPipelineCounts = {
  NEW: number
  REVIEWING: number
  ACCEPTED: number
  DECLINED: number
  DUPLICATE: number
  total: number
  open: number
}

export function emptyApplicationPipeline(): ApplicationPipelineCounts {
  return {
    NEW: 0,
    REVIEWING: 0,
    ACCEPTED: 0,
    DECLINED: 0,
    DUPLICATE: 0,
    total: 0,
    open: 0,
  }
}

export function tallyApplicationStatuses(
  statuses: string[],
): ApplicationPipelineCounts {
  const counts = emptyApplicationPipeline()
  for (const status of statuses) {
    if (status === 'NEW') counts.NEW += 1
    else if (status === 'REVIEWING') counts.REVIEWING += 1
    else if (status === 'ACCEPTED') counts.ACCEPTED += 1
    else if (status === 'DECLINED') counts.DECLINED += 1
    else if (status === 'DUPLICATE') counts.DUPLICATE += 1
    counts.total += 1
  }
  counts.open = counts.NEW + counts.REVIEWING + counts.DUPLICATE
  return counts
}
