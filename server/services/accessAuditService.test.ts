import { describe, expect, it } from 'vitest'
import { ACCESS_AUDIT_EVENT_TYPES } from './accessAuditService.ts'
import { AUDIT_EVENT_TYPES } from '../domain/enums.ts'

describe('accessAuditService', () => {
  it('lists access event types that exist in the audit enum', () => {
    for (const type of ACCESS_AUDIT_EVENT_TYPES) {
      expect(AUDIT_EVENT_TYPES).toContain(type)
    }
    expect(ACCESS_AUDIT_EVENT_TYPES).toContain('BOARD_UNLOCKED')
    expect(ACCESS_AUDIT_EVENT_TYPES).toContain('APPLICATION_ACCEPTED')
  })
})
