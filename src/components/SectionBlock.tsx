'use client'
import { useEffect, useRef } from 'react'
import { TopicSection } from '@/types'

interface Props {
  section: TopicSection
}

export function SectionBlock({ section }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!section.hasMermaid || !bodyRef.current) return
    const codeBlocks = bodyRef.current.querySelectorAll('code.language-mermaid')
    if (codeBlocks.length === 0) return

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' })
      codeBlocks.forEach(async (block, i) => {
        const chart = block.textContent || ''
        const id = `mermaid-${Date.now()}-${i}`
        try {
          const { svg } = await mermaid.render(id, chart)
          const wrapper = document.createElement('div')
          wrapper.innerHTML = svg
          block.parentElement?.replaceWith(wrapper)
        } catch {
          // leave as code block if mermaid fails
        }
      })
    })
  }, [section.hasMermaid, section.html])

  return (
    <div
      className={`section-${section.color} rounded-lg overflow-hidden`}
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: `color-mix(in srgb, var(--c) 7%, var(--card-bg))` }}
      >
        <div
          className="flex-shrink-0 rounded-sm"
          style={{ width: 4, height: 18, background: 'var(--c)' }}
        />
        <span
          className="flex-1 text-xs font-bold uppercase tracking-wide"
          style={{ color: 'var(--c)', letterSpacing: '0.05em' }}
        >
          {section.heading}
        </span>
        {section.label && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded"
            style={{
              background: `color-mix(in srgb, var(--c) 15%, transparent)`,
              color: 'var(--c)',
            }}
          >
            {section.label}
          </span>
        )}
      </div>

      {/* Body — strip the h2 tag since we already render it in the header */}
      <div
        ref={bodyRef}
        className="prose-content px-3 pb-3 pt-2"
        style={{
          background: 'var(--section-bg)',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
        dangerouslySetInnerHTML={{ __html: section.html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '') }}
      />
    </div>
  )
}
