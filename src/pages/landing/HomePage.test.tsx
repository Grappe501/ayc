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
  it('renders the newcomer landing with one H1', () => {
    const html = renderHome()
    expect(html).toContain('A home for young Arkansans ready to lead.')
    expect(html.match(/<h1\b/g)?.length).toBe(1)
  })

  it('displays the canonical mission unchanged', () => {
    const html = renderHome()
    expect(html).toContain('data-testid="canonical-mission"')
    expect(html).toContain('Youth (16 - 24)')
    expect(html).toContain('Natural State')
    for (const chunk of AYC_MISSION.split(/(?<=\.)\s+(?=[A-Z])/)) {
      expect(html.replace(/<[^>]+>/g, '')).toContain(chunk)
    }
  })

  it('emphasizes join over leadership in the hero', () => {
    const html = renderHome()
    expect(html).toContain('href="/join"')
    expect(html).toContain('Join AYC')
    expect(html).toContain('Why join AYC now.')
    expect(html).toContain('Why volunteer with us.')
    expect(html).toContain('Why step into leadership.')
  })

  it('places the AYC logo mark beside the hero headline', () => {
    const html = renderHome()
    expect(html).toContain('landing-hero__mark')
    expect(html).toContain('alt="Arkansas Youth Coalition"')
  })

  it('keeps leadership tools at the bottom', () => {
    const html = renderHome()
    expect(html).toContain('Leadership Workbench')
    expect(html).toContain('href="/leader"')
    expect(html).toContain('Enter Leader Board')
    const joinIdx = html.indexOf('Start your join form')
    const leaderIdx = html.indexOf('Enter Leader Board')
    expect(joinIdx).toBeGreaterThan(-1)
    expect(leaderIdx).toBeGreaterThan(joinIdx)
  })

  it('renders five team names and momentum', () => {
    const html = renderHome()
    for (const team of TEAMS) {
      expect(html).toContain(team.name)
    }
    expect(html).toContain('100+')
    expect(html).toContain('civic leadership')
  })

  it('does not expose unapproved Phase 2 navigation', () => {
    const html = renderHome()
    expect(html).not.toContain('href="/events"')
    expect(html).not.toContain('href="/admin"')
    expect(html).not.toContain('href="/training"')
  })
})
