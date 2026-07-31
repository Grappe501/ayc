import { describe, expect, it } from 'vitest'
import { ARCHIVE_REASON_LABELS, ARCHIVE_REASONS, RESTORE_STATUSES } from './archiveReasons.ts'

describe('archiveReasons', () => {
  it('includes Screen Bible archive reason options', () => {
    expect(ARCHIVE_REASONS).toContain('NO_LONGER_ACTIVE')
    expect(ARCHIVE_REASONS).toContain('DUPLICATE_RECORD')
    expect(ARCHIVE_REASON_LABELS.REQUESTED_REMOVAL).toBe('Requested removal')
  })

  it('limits restore statuses to non-archived operational values', () => {
    expect(RESTORE_STATUSES).toEqual(['ACTIVE', 'PROSPECTIVE', 'INACTIVE'])
  })
})
