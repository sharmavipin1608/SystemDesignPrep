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

function SidebarContent({
  navGroups,
  searchEntries,
  onLinkClick,
}: {
  navGroups: NavGroup[]
  searchEntries: SearchEntry[]
  onLinkClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-bold text-sm" style={{ color: 'var(--accent)', letterSpacing: '-0.3px' }}>
          SystemDesign.prep
        </span>
        <ThemeToggle />
      </div>

      <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <SearchModal entries={searchEntries} />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map(group => (
          <div key={group.slug} className="mb-5">
            <div className="flex items-center gap-1.5 px-2 mb-1.5">
              <span
                className="inline-block rounded-sm flex-shrink-0"
                style={{ width: 7, height: 7, background: group.color }}
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
                  onClick={onLinkClick}
                  className="block px-2.5 py-1.5 rounded-md text-[13px] mb-0.5 transition-colors"
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
    </>
  )
}

export function Sidebar({ navGroups, searchEntries }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar — fixed position, visible md+, pushes content via margin-left ── */}
      <aside
        className="desktop-only flex-col"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '220px',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 20,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <SidebarContent navGroups={navGroups} searchEntries={searchEntries} />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen(o => !o)}
        className="mobile-only"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 50,
          padding: 8, borderRadius: 6,
          background: 'var(--card-bg)', border: '1px solid var(--border)',
        }}
      >
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text)', marginBottom: 4 }} />
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text)', marginBottom: 4 }} />
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text)' }} />
      </button>

      {/* ── Mobile: backdrop ── */}
      {open && (
        <div
          className="mobile-only"
          style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in panel ── */}
      <aside
        className="mobile-only"
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 40, height: '100%',
          width: 260, display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 200ms',
          background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
        }}
      >
        <SidebarContent
          navGroups={navGroups}
          searchEntries={searchEntries}
          onLinkClick={() => setOpen(false)}
        />
      </aside>
    </>
  )
}
