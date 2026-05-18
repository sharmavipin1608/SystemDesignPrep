import { getTopicsForGroup, getNavGroups } from '@/lib/groups'

describe('getTopicsForGroup', () => {
  it('returns slugs for files in the group folder', () => {
    const topics = getTopicsForGroup('caching')
    expect(topics).toContain('caching')
    expect(topics).toContain('redis-vs-memcached')
  })

  it('excludes non-.md files', () => {
    const topics = getTopicsForGroup('caching')
    topics.forEach(t => expect(t).not.toContain('.'))
  })

  it('returns slugs sorted alphabetically', () => {
    const topics = getTopicsForGroup('caching')
    expect(topics).toEqual([...topics].sort())
  })
})

describe('getNavGroups', () => {
  it('returns all 6 configured groups', () => {
    const navGroups = getNavGroups()
    expect(navGroups).toHaveLength(6)
    expect(navGroups.map(g => g.slug)).toContain('caching')
    expect(navGroups.map(g => g.slug)).toContain('databases')
    expect(navGroups.map(g => g.slug)).toContain('patterns')
  })

  it('each group has a non-empty topics array', () => {
    const navGroups = getNavGroups()
    navGroups.forEach(g => {
      expect(g.topics.length).toBeGreaterThan(0)
    })
  })

  it('caching group contains caching and redis-vs-memcached', () => {
    const navGroups = getNavGroups()
    const caching = navGroups.find(g => g.slug === 'caching')!
    expect(caching.topics).toContain('caching')
    expect(caching.topics).toContain('redis-vs-memcached')
  })
})
