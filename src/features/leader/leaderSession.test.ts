import { afterEach, describe, expect, it } from 'vitest'
import {
  clearLeaderSession,
  getLeaderWriteSecret,
  hasLeaderSession,
  setLeaderSession,
} from './leaderSession'

const memory = new Map<string, string>()

afterEach(() => {
  memory.clear()
})

describe('leaderSession', () => {
  it('stores and clears the write secret in sessionStorage', () => {
    // jsdom-less stub
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value)
        },
        removeItem: (key: string) => {
          memory.delete(key)
        },
      },
    })

    expect(hasLeaderSession()).toBe(false)
    setLeaderSession('test-secret')
    expect(hasLeaderSession()).toBe(true)
    expect(getLeaderWriteSecret()).toBe('test-secret')
    clearLeaderSession()
    expect(hasLeaderSession()).toBe(false)
  })
})
