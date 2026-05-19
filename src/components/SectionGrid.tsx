import { TopicSection } from '@/types'
import { SectionBlock } from './SectionBlock'

interface Props {
  sections: TopicSection[]
}

export function SectionGrid({ sections }: Props) {
  return (
    <div className="section-grid">
      {sections.map((section, i) => (
        <SectionBlock key={i} section={section} />
      ))}
    </div>
  )
}
