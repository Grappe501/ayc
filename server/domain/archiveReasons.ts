export const ARCHIVE_REASONS = [
  'NO_LONGER_ACTIVE',
  'DUPLICATE_RECORD',
  'REQUESTED_REMOVAL',
  'ENTERED_IN_ERROR',
  'OTHER',
] as const

export type ArchiveReason = (typeof ARCHIVE_REASONS)[number]

export const ARCHIVE_REASON_LABELS: Record<ArchiveReason, string> = {
  NO_LONGER_ACTIVE: 'No longer active',
  DUPLICATE_RECORD: 'Duplicate record',
  REQUESTED_REMOVAL: 'Requested removal',
  ENTERED_IN_ERROR: 'Entered in error',
  OTHER: 'Other',
}

export const RESTORE_STATUSES = ['ACTIVE', 'PROSPECTIVE', 'INACTIVE'] as const
export type RestoreStatus = (typeof RESTORE_STATUSES)[number]
