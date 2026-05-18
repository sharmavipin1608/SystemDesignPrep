import { readdirSync } from 'fs'
import path from 'path'
import { groups as groupConfigs } from '@/config/groups'
import { NavGroup } from '@/types'

export function getTopicsForGroup(groupSlug: string): string[] {
  const dir = path.join(process.cwd(), 'content', groupSlug)
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .sort()
}

export function getNavGroups(): NavGroup[] {
  return groupConfigs.map(g => ({
    ...g,
    topics: getTopicsForGroup(g.slug),
  }))
}
