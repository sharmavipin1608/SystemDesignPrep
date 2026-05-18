import { getNavGroups } from '@/lib/groups'
import { getTopicHtml } from '@/lib/markdown'
import { splitIntoSections, getSubtitle } from '@/lib/sections'
import { SectionGrid } from '@/components/SectionGrid'

interface Props {
  params: Promise<{ group: string; topic: string }>
}

export async function generateStaticParams() {
  return getNavGroups().flatMap(group =>
    group.topics.map(topic => ({ group: group.slug, topic })),
  )
}

function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default async function TopicPage({ params }: Props) {
  const { group: groupSlug, topic: topicSlug } = await params
  const html = await getTopicHtml(groupSlug, topicSlug)
  const sections = splitIntoSections(html)
  const subtitle = getSubtitle(sections)
  const title = slugToTitle(topicSlug)

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1
        className="text-2xl font-bold tracking-tight mb-1"
        style={{ color: 'var(--text)' }}
      >
        {title}
      </h1>
      <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
        {subtitle}
      </p>
      <SectionGrid sections={sections} />
    </div>
  )
}
