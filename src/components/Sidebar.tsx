'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavGroup, SearchEntry } from '@/types'
import { ThemeToggle } from './ThemeToggle'
import { SearchModal } from './SearchModal'

function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

interface Props {
  navGroups: NavGroup[]
  searchEntries: SearchEntry[]
}

export function Sidebar({ navGroups, searchEntries }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen(o => !o)}
        className="md:hidden fixed top-3 left-3 z-50 p-1.5 rounded"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
      >
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text)', marginBottom: 4 }} />
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text)', marginBottom: 4 }} />
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text)' }} />
      </button>

      {/* Overlay on mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-40 h-full flex flex-col
          w-[220px] transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
            SystemDesign.prep
          </span>
          <ThemeToggle />
        </div>

        {/* Search */}
        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <SearchModal entries={searchEntries} />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map(group => (
            <div key={group.slug} className="mb-5">
              <div className="flex items-center gap-1.5 px-2 mb-1">
                <span
                  className="inline-block rounded-sm"
                  style={{ width: 7, height: 7, background: group.color, flexShrink: 0 }}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {group.title}
                </span>
              </div>
              {group.topics.map(topicSlug => {
                const href = `/${group.slug}/${topicSlug}`
                const isActive = pathname === href
                return (
                  <Link
                    key={topicSlug}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block px-2.5 py-1.5 rounded-md text-[13px] font-medium mb-0.5 transition-colors"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      background: isActive ? 'var(--card-bg)' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {slugToTitle(topicSlug)}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
