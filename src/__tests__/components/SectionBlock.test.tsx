import { render, screen } from '@testing-library/react'
import { SectionBlock } from '@/components/SectionBlock'
import { TopicSection } from '@/types'

const mockSection: TopicSection = {
  heading: 'Failure Modes & Mitigations',
  html: '<h2>Failure Modes &amp; Mitigations</h2><p>Cache stampede is bad.</p>',
  color: 'red',
  label: '⚠ Critical',
  hasMermaid: false,
}

describe('SectionBlock', () => {
  it('renders the section heading', () => {
    render(<SectionBlock section={mockSection} />)
    expect(screen.getByText('Failure Modes & Mitigations')).toBeInTheDocument()
  })

  it('renders the section label', () => {
    render(<SectionBlock section={mockSection} />)
    expect(screen.getByText('⚠ Critical')).toBeInTheDocument()
  })

  it('applies the color class to the container', () => {
    const { container } = render(<SectionBlock section={mockSection} />)
    expect(container.firstChild).toHaveClass('section-red')
  })
})
