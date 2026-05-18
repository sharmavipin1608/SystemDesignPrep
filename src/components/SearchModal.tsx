'use client'
import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { SearchEntry } from '@/types'

interface Props {
  entries: SearchEntry[]
}

export function SearchModal({ entries }: Props) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () => new Fuse(entries, { keys: ['section', 'body', 'topic'], threshold: 0.35, minMatchCharLength: 2 }),
    [entries],
  )

  const results = query.trim().length >= 2 ? fuse.search(query).slice(0, 12) : []

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search topics..."
        className="w-full text-xs rounded-md px-3 py-2 outline-none"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />

      {results.length > 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 rounded-md overflow-hidden z-50 max-h-72 overflow-y-auto"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
        >
          {results.map(({ item }, i) => (
            <li key={i}>
              <a
                href={`${item.slug}#${item.section.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="flex flex-col px-3 py-2 hover:opacity-80 transition-opacity"
                style={{ borderBottom: '1px solid var(--border)' }}
                onClick={() => setQuery('')}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  {item.section}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {item.topic} · {item.group}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
