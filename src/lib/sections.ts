import { sectionColorRules, defaultSectionColor } from '@/config/section-colors'
import { TopicSection } from '@/types'

function getColorForHeading(heading: string): { color: string; label: string } {
  const lower = heading.toLowerCase()
  for (const rule of sectionColorRules) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return { color: rule.color, label: rule.label }
    }
  }
  return defaultSectionColor
}

export function splitIntoSections(html: string): TopicSection[] {
  const parts = html.split(/(?=<h2[\s>])/)
  return parts
    .filter(p => p.trim().length > 0 && p.includes('<h2'))
    .map(part => {
      const headingMatch = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      const heading = headingMatch
        ? headingMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
        : ''
      const { color, label } = getColorForHeading(heading)
      const hasMermaid = part.includes('language-mermaid')
      return { heading, html: part, color, label, hasMermaid }
    })
    .filter(s => s.heading.length > 0)
}

function shortenHeading(heading: string): string {
  return heading
    .replace(/\([^)]*\)/g, '')        // strip parentheticals
    .replace(/^(what is it\??|overview|introduction)/i, '')
    .replace(/^the\s+/i, '')           // strip leading "The"
    .replace(/\s+(strategies|policies|techniques|problem|patterns|guide|overview)\s*$/i, '')
    .replace(/^cache\s+/i, '')         // strip leading "Cache"
    .trim()
}

export function getSubtitle(sections: TopicSection[]): string {
  return sections
    .map(s => shortenHeading(s.heading))
    .filter(s => s.length > 0)
    .slice(0, 4)
    .join(' · ')
}
