export interface TopicSection {
  heading: string
  html: string
  color: string
  label: string
  hasMermaid: boolean
}

export interface TopicMeta {
  slug: string
  title: string
  groupSlug: string
  groupTitle: string
  subtitle: string
}

export interface SearchEntry {
  topic: string
  topicSlug: string
  group: string
  groupSlug: string
  section: string
  slug: string
  body: string
}

export interface GroupConfig {
  slug: string
  title: string
  color: string
}

export interface NavGroup extends GroupConfig {
  topics: string[]   // populated at build time by scanning content/<slug>/
}
