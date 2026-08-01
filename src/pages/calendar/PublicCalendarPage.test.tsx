import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { PublicCalendarPage } from './PublicCalendarPage'

vi.mock('@/features/public/publicCalendarApi', () => ({
  fetchPublicCalendarEvents: vi.fn(async () => ({
    ok: true,
    data: {
      generatedAt: new Date().toISOString(),
      from: new Date().toISOString(),
      to: new Date().toISOString(),
      events: [
        {
          id: 'evt-1',
          occurrenceKey: 'evt-1_start',
          occurrenceStartsAt: new Date().toISOString(),
          isRecurring: false,
          recurrenceLabel: null,
          title: 'Statewide organizing call',
          description: 'Open to members and guests.',
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 3600_000).toISOString(),
          allDay: false,
          locationText: 'Zoom',
          url: 'https://example.com/call',
          sourceBoard: { name: 'Main', slug: 'main', kind: 'MAIN' },
        },
      ],
    },
  })),
  publicCalendarIcsHref: () => '/api/public-calendar-ics',
}))

describe('PublicCalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders public calendar chrome and subscribe action', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PublicCalendarPage />
      </MemoryRouter>,
    )
    expect(html).toContain('Public calendar')
    expect(html).toContain('Subscribe ICS')
    expect(html).toContain('href="/api/public-calendar-ics"')
    expect(html).toContain('href="/join"')
  })
})
