/* @jest-environment node */
import { splitIntoSections, getSubtitle } from '@/lib/sections'

describe('splitIntoSections', () => {
  it('splits HTML into blocks by h2 headings', () => {
    const html = '<h2>What is it?</h2><p>Concept body.</p><h2>Failure Modes &amp; Mitigations</h2><p>Bad things.</p>'
    const sections = splitIntoSections(html)
    expect(sections).toHaveLength(2)
    expect(sections[0].heading).toBe('What is it?')
    expect(sections[1].heading).toBe('Failure Modes & Mitigations')
  })

  it('assigns blue to "What is it?" heading', () => {
    const html = '<h2>What is it?</h2><p>Content</p>'
    const [section] = splitIntoSections(html)
    expect(section.color).toBe('blue')
    expect(section.label).toBe('Concept')
  })

  it('assigns red to "Failure Modes" heading', () => {
    const html = '<h2>Failure Modes &amp; Mitigations</h2><p>Content</p>'
    const [section] = splitIntoSections(html)
    expect(section.color).toBe('red')
    expect(section.label).toBe('⚠ Critical')
  })

  it('assigns gold to "Interview Talking Points" heading', () => {
    const html = '<h2>Interview Talking Points</h2><p>Content</p>'
    const [section] = splitIntoSections(html)
    expect(section.color).toBe('gold')
    expect(section.label).toBe('★ Must Know')
  })

  it('assigns teal to strategy headings', () => {
    const html = '<h2>Caching Strategies (Write/Read Patterns)</h2><p>Content</p>'
    const [section] = splitIntoSections(html)
    expect(section.color).toBe('teal')
  })

  it('sets hasMermaid true when section contains mermaid code block', () => {
    const html = '<h2>How it Works</h2><pre><code class="language-mermaid">graph TD</code></pre>'
    const [section] = splitIntoSections(html)
    expect(section.hasMermaid).toBe(true)
  })

  it('sets hasMermaid false when no mermaid block', () => {
    const html = '<h2>What is it?</h2><p>No diagram here.</p>'
    const [section] = splitIntoSections(html)
    expect(section.hasMermaid).toBe(false)
  })
})

describe('getSubtitle', () => {
  it('joins first 4 headings with dot separator', () => {
    const sections = [
      { heading: 'What is it?', html: '', color: 'blue', label: '', hasMermaid: false },
      { heading: 'Strategies', html: '', color: 'teal', label: '', hasMermaid: false },
      { heading: 'Failure Modes', html: '', color: 'red', label: '', hasMermaid: false },
      { heading: 'Interview Talking Points', html: '', color: 'gold', label: '', hasMermaid: false },
      { heading: 'Extra Section', html: '', color: 'blue', label: '', hasMermaid: false },
    ]
    expect(getSubtitle(sections)).toBe('Strategies · Failure Modes · Interview Talking Points · Extra Section')
  })
})
