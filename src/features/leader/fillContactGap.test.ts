import { describe, expect, it, vi, beforeEach } from 'vitest'

const fetchContact = vi.fn()
const updateContact = vi.fn()
const updateContactFlags = vi.fn()

vi.mock('@/features/leader/leaderApi', () => ({
  fetchContact: (...args: unknown[]) => fetchContact(...args),
  updateContact: (...args: unknown[]) => updateContact(...args),
  updateContactFlags: (...args: unknown[]) => updateContactFlags(...args),
}))

import { fillContactGap } from './fillContactGap'

describe('fillContactGap', () => {
  beforeEach(() => {
    fetchContact.mockReset()
    updateContact.mockReset()
    updateContactFlags.mockReset()
  })

  it('requires phone or email', async () => {
    fetchContact.mockResolvedValue({
      ok: true,
      data: {
        firstName: 'A',
        lastName: 'B',
        middleName: null,
        preferredName: null,
        status: 'ACTIVE',
        source: 'LEADER_ENTRY',
        location: {
          id: 'loc',
          locationType: 'COLLEGE',
          name: 'UCA',
          code: 'UCA',
        },
        primaryTeam: { id: 't1', position: 'VOLUNTEER' },
        additionalTeams: [],
        email: null,
        phone: null,
      },
    })

    const result = await fillContactGap('p1', { email: '', phone: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toMatch(/phone|email/i)
    expect(updateContact).not.toHaveBeenCalled()
  })

  it('patches contact methods and keeps team/location', async () => {
    fetchContact.mockResolvedValue({
      ok: true,
      data: {
        firstName: 'Chance',
        lastName: 'Bradford',
        middleName: null,
        preferredName: null,
        status: 'ACTIVE',
        source: 'LEADER_ENTRY',
        location: {
          id: 'loc',
          locationType: 'COUNTY',
          name: 'Arkansas Youth Coalition',
          code: 'AYC',
        },
        primaryTeam: { id: 'org', position: 'LEAD' },
        additionalTeams: [{ id: 'out', position: 'VOLUNTEER' }],
        email: null,
        phone: null,
      },
    })
    updateContact.mockResolvedValue({
      ok: true,
      data: {
        personId: 'p1',
        displayName: 'Chance Bradford',
        contact: { id: 'p1', hasEmail: true },
      },
    })

    const result = await fillContactGap('p1', {
      email: 'chance@example.com',
      phone: '5015550100',
    })
    expect(result.ok).toBe(true)
    expect(updateContact).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        email: 'chance@example.com',
        phone: '5015550100',
        preferredContactMethod: 'EITHER',
        primaryTeamId: 'org',
        additionalTeamIds: ['out'],
        position: 'LEAD',
        location: expect.objectContaining({ id: 'loc', code: 'AYC' }),
      }),
    )
  })
})
