'use client'
import { useEffect, useRef, useState } from 'react'
import { TopicSection } from '@/types'

interface Props {
  section: TopicSection
}

const COLLAPSED_HEIGHT = 160

export function SectionBlock({ section }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(true)

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
      style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}
    >
      {/* Header: left accent bar + heading + label badge */}
      <div className="flex items-stretch" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 4, background: 'var(--c)', flexShrink: 0 }} />
        <div className="flex items-center gap-2 px-3 py-2.5 flex-1 min-w-0">
          <span
            className="flex-1 min-w-0 text-xs font-bold uppercase tracking-wide truncate"
            style={{ color: 'var(--c)' }}
          >
            {section.heading}
          </span>
          {section.label && (
            <span
              className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ border: '1px solid var(--c)', color: 'var(--c)', opacity: 0.85 }}
            >
              {section.label}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ position: 'relative', background: 'var(--section-bg)' }}>
        <div
          ref={bodyRef}
          className="prose-content px-4 pb-4 pt-3"
          style={{
            color: 'var(--text-muted)',
            ...(section.hasMermaid && collapsed
              ? { maxHeight: COLLAPSED_HEIGHT, overflow: 'hidden' }
              : {}),
          }}
          dangerouslySetInnerHTML={{ __html: section.html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '') }}
        />

        {/* Gradient fade when collapsed */}
        {section.hasMermaid && collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 48,
              background: 'linear-gradient(transparent, var(--section-bg))',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Expand / collapse toggle */}
        {section.hasMermaid && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              display: 'block',
              width: '100%',
              padding: '5px 0',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textAlign: 'center',
              color: 'var(--c)',
              background: 'var(--card-bg)',
              borderTop: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {collapsed ? '▼ Show diagram' : '▲ Collapse'}
          </button>
        )}
      </div>
    </div>
  )
}
