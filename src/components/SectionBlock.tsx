'use client'
import { useEffect, useRef, useState } from 'react'
import { TopicSection } from '@/types'

interface Props {
  section: TopicSection
}

const COLLAPSED_HEIGHT = 180
const rawHtml = (html: string) => html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '')

export function SectionBlock({ section }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(true)
  // After mermaid renders SVGs into the DOM, we capture the innerHTML here.
  // This prevents React re-renders (from toggling collapsed) from stomping
  // the SVGs back to raw <code> blocks via dangerouslySetInnerHTML.
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null)

  useEffect(() => {
    // Reset on section change
    setRenderedHtml(null)

    if (!section.hasMermaid || !bodyRef.current) return
    const codeBlocks = bodyRef.current.querySelectorAll('code.language-mermaid')
    if (codeBlocks.length === 0) return

    const total = codeBlocks.length
    let done = 0

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
        } finally {
          done++
          if (done === total && bodyRef.current) {
            // Capture SVG-rendered HTML so future re-renders use it
            setRenderedHtml(bodyRef.current.innerHTML)
          }
        }
      })
    })
  }, [section.hasMermaid, section.html])

  const displayHtml = renderedHtml ?? rawHtml(section.html)

  return (
    <div
      className={`section-${section.color}`}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '4px solid var(--c)',
        background: 'var(--card-bg)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--c)',
          }}
        >
          {section.heading}
        </span>
        {section.label && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 4,
              border: '1px solid var(--c)',
              color: 'var(--c)',
              opacity: 0.9,
              whiteSpace: 'nowrap',
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            {section.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ position: 'relative', background: 'var(--section-bg)' }}>
        <div
          ref={bodyRef}
          className="prose-content"
          style={{
            padding: '10px 14px 12px',
            color: 'var(--text-muted)',
            ...(section.hasMermaid && collapsed
              ? { maxHeight: COLLAPSED_HEIGHT, overflow: 'hidden' }
              : {}),
          }}
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />

        {section.hasMermaid && collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: 52,
              background: 'linear-gradient(transparent, var(--section-bg))',
              pointerEvents: 'none',
            }}
          />
        )}

        {section.hasMermaid && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              display: 'block',
              width: '100%',
              padding: '5px 0',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textAlign: 'center',
              color: 'var(--c)',
              background: 'var(--card-bg)',
              borderTop: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {collapsed ? '▼  Show diagram' : '▲  Collapse'}
          </button>
        )}
      </div>
    </div>
  )
}
