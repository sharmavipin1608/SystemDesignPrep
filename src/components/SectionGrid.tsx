import { TopicSection } from '@/types'
import { SectionBlock } from './SectionBlock'

interface Props {
  sections: TopicSection[]
}

export function SectionGrid({ sections }: Props) {
  return (
    <div className="section-grid">
      {sections.map((section, i) => (
        <div key={i} className={section.hasMermaid ? 'full-width' : ''}>
          <SectionBlock section={section} />
        </div>
      ))}
    </div>
  )
}
