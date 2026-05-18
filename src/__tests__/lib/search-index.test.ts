/* @jest-environment node */
import { buildSearchEntries } from '@/lib/search-index'
import { GroupConfig, TopicSection } from '@/types'

const mockGroup: GroupConfig = {
  slug: 'caching',
  title: 'Caching',
  color: '#7c6aff',
}

const mockSections: TopicSection[] = [
  { heading: 'What is it?', html: '<h2>What is it?</h2><p>Stores data in memory.</p>', color: 'blue', label: 'Concept', hasMermaid: false },
  { heading: 'Interview Talking Points', html: '<h2>Interview Talking Points</h2><p>Mention TTL.</p>', color: 'gold', label: '★ Must Know', hasMermaid: false },
]

describe('buildSearchEntries', () => {
  it('creates one entry per section', () => {
    const entries = buildSearchEntries(mockGroup, 'caching', mockSections)
    expect(entries).toHaveLength(2)
  })

  it('sets correct slug for each entry', () => {
    const entries = buildSearchEntries(mockGroup, 'caching', mockSections)
    expect(entries[0].slug).toBe('/caching/caching')
  })

  it('sets section heading as section field', () => {
    const entries = buildSearchEntries(mockGroup, 'caching', mockSections)
    expect(entries[0].section).toBe('What is it?')
    expect(entries[1].section).toBe('Interview Talking Points')
  })

  it('strips HTML tags from body text', () => {
    const entries = buildSearchEntries(mockGroup, 'caching', mockSections)
    expect(entries[0].body).not.toContain('<h2>')
    expect(entries[0].body).toContain('Stores data in memory')
  })

  it('sets topic title from slug (hyphen-to-title-case)', () => {
    const entries = buildSearchEntries(mockGroup, 'redis-vs-memcached', mockSections)
    expect(entries[0].topic).toBe('Redis Vs Memcached')
  })
})
