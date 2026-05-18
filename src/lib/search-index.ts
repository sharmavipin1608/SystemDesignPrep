import { GroupConfig, SearchEntry, TopicSection } from '@/types'
import { getNavGroups } from './groups'
import { getTopicHtml } from './markdown'
import { splitIntoSections } from './sections'

export function buildSearchEntries(
  group: GroupConfig,
  topicSlug: string,
  sections: TopicSection[],
): SearchEntry[] {
  const topicTitle = topicSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return sections.map(section => ({
    topic: topicTitle,
    topicSlug,
    group: group.title,
    groupSlug: group.slug,
    section: section.heading,
    slug: `/${group.slug}/${topicSlug}`,
    body: section.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  }))
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = []
  for (const group of getNavGroups()) {
    for (const topicSlug of group.topics) {
      const html = await getTopicHtml(group.slug, topicSlug)
      const sections = splitIntoSections(html)
      entries.push(...buildSearchEntries(group, topicSlug, sections))
    }
  }
  return entries
}
