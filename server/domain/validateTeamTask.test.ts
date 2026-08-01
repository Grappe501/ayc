import { describe, expect, it } from 'vitest'
import { validateTeamTaskCreate } from './validateTeamTask.ts'

describe('validateTeamTaskCreate', () => {
  it('requires a title', () => {
    const result = validateTeamTaskCreate({ title: '  ' })
    expect(result.ok).toBe(false)
  })

  it('accepts a normal open task', () => {
    const result = validateTeamTaskCreate({
      title: 'Fill contact gaps',
      notes: 'Start with Organizer prospectives',
      priority: 'HIGH',
      dueOn: '2026-08-15',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.title).toBe('Fill contact gaps')
      expect(result.value.status).toBe('OPEN')
      expect(result.value.priority).toBe('HIGH')
      expect(result.value.dueOn).toBe('2026-08-15')
    }
  })
})
