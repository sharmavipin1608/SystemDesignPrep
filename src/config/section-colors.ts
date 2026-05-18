export interface SectionColorRule {
  keywords: string[]
  color: string
  label: string
}

export const sectionColorRules: SectionColorRule[] = [
  { keywords: ['what is it', 'core concept', 'overview'], color: 'blue', label: 'Concept' },
  { keywords: ['how it works', 'internals', 'how cdc works', 'the plumbing'], color: 'purple', label: 'Mechanism' },
  { keywords: ['strateg', 'pattern', 'algorithm', 'cheat sheet'], color: 'teal', label: 'Patterns' },
  { keywords: ['failure', 'constraint', 'mitig', 'single point of failure'], color: 'red', label: '⚠ Critical' },
  { keywords: ['when to use', 'decision', 'tl;dr', 'side-by-side', 'high-level comparison'], color: 'amber', label: 'Decision' },
  { keywords: ['interview'], color: 'gold', label: '★ Must Know' },
]

export const defaultSectionColor: Pick<SectionColorRule, 'color' | 'label'> = {
  color: 'blue',
  label: '',
}
