import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/features/leader/leaderSession', () => ({
  getLeaderWriteSecret: () => 'test-secret',
  hasLeaderSession: () => true,
  getLeaderScope: () => ({ kind: 'master', label: 'Master' }),
  clearLeaderSession: () => undefined,
  setLeaderSession: () => undefined,
}))

vi.mock('@/features/leader/leaderApi', () => ({
  fetchLeaderFeedback: vi.fn(async () => ({
    ok: true as const,
    data: { total: 0, openCount: 0, items: [] },
  })),
  updateLeaderFeedback: vi.fn(),
}))

import { FeedbackInboxPage } from './FeedbackInboxPage'

describe('FeedbackInboxPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders inbox chrome for an unlocked leader', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <FeedbackInboxPage />
      </MemoryRouter>,
    )
    expect(html).toContain('Beta Feedback Inbox')
    expect(html).toContain('Open items')
    expect(html).toContain('Leader Board')
  })
})
