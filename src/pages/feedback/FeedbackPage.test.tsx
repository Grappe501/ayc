import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { FeedbackPage } from './FeedbackPage'

function renderFeedback(from = '/directory') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/feedback?from=${encodeURIComponent(from)}`]}>
      <FeedbackPage />
    </MemoryRouter>,
  )
}

describe('FeedbackPage', () => {
  it('renders Screen Bible header and required fields', () => {
    const html = renderFeedback()
    expect(html).toContain('Help Build the Workbench')
    expect(html).toContain('What kind of feedback is this?')
    expect(html).toContain('Something is confusing')
    expect(html).toContain('Submit Feedback')
    expect(html).toContain('Leadership Directory')
  })
})
