import { TopicSection } from '@/types'
import { SectionBlock } from './SectionBlock'

interface Props {
  sections: TopicSection[]
}

export function SectionGrid({ sections }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sections.map((section, i) => (
        <div key={i} className={section.hasMermaid ? 'md:col-span-2' : ''}>
          <SectionBlock section={section} />
        </div>
      ))}
    </div>
  )
}
