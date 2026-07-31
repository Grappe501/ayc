import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from './HomePage'
import { AYC_MISSION, TEAMS } from '@/content/ayc'

function renderHome() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage landing', () => {
  it('renders the landing page with one H1', () => {
    const html = renderHome()
    expect(html).toContain('Young Arkansans are not waiting for the future.')
    expect(html.match(/<h1\b/g)?.length).toBe(1)
  })

  it('displays the canonical mission unchanged', () => {
    const html = renderHome()
    expect(html).toContain('data-testid="canonical-mission"')
    expect(html).toContain('Youth (16 - 24)')
    expect(html).toContain('Natural State')
    expect(html).toContain('young people from all walks of life')
    expect(html).toContain('bridge the gap')
    // Full mission characters remain present across paragraphs/highlights
    for (const chunk of AYC_MISSION.split(/(?<=\.)\s+(?=[A-Z])/)) {
      expect(html.replace(/<[^>]+>/g, '')).toContain(chunk)
    }
  })

  it('links hero actions to leader and directory', () => {
    const html = renderHome()
    expect(html).toContain('href="/leader"')
    expect(html).toContain('Enter the Leader Board')
    expect(html).toContain('href="/directory"')
    expect(html).toContain('View the Leadership Directory')
  })

  it('links feedback action', () => {
    const html = renderHome()
    expect(html).toContain('href="/feedback"')
    expect(html).toContain('Share Beta Feedback')
  })

  it('renders five team names and core sections', () => {
    const html = renderHome()
    for (const team of TEAMS) {
      expect(html).toContain(team.name)
    }
    expect(html).toContain('Here’s What We Heard')
    expect(html).toContain('What We Are Building')
    expect(html).toContain('How We Get There')
    expect(html).toContain('Five Teams. One Coalition.')
    expect(html).toContain('Built With the Leadership Team')
    expect(html).toContain('This is where the network begins.')
  })

  it('does not expose unapproved Phase 2 navigation', () => {
    const html = renderHome()
    expect(html).not.toContain('href="/events"')
    expect(html).not.toContain('href="/admin"')
    expect(html).not.toContain('href="/training"')
  })
})
