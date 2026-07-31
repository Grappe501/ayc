import { describe, expect, it } from 'vitest'
import { emphasizeMissionText } from './missionFormat'
import { AYC_MISSION } from './ayc'
import { renderToStaticMarkup } from 'react-dom/server'

describe('missionFormat', () => {
  it('emphasizes phrases without rewriting mission text', () => {
    const nodes = emphasizeMissionText(AYC_MISSION)
    const html = renderToStaticMarkup(<>{nodes}</>)
    const plain = html.replace(/<[^>]+>/g, '')
    expect(plain).toBe(AYC_MISSION)
    expect(html).toContain('mission-highlight')
  })
})
