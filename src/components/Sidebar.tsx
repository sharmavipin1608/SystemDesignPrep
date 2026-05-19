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
      {/* Logo + theme toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          flexShrink: 0,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '-0.3px' }}>
          SystemDesign.prep
        </span>
        <ThemeToggle />
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <SearchModal entries={searchEntries} />
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {navGroups.map(group => (
          <div key={group.slug} style={{ marginBottom: 20 }}>
            {/* Group label row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 8px',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: group.color,
                }}
              />
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--text-dim)',
                }}
              >
                {group.title}
              </span>
            </div>

            {/* Topic links */}
            {group.topics.map(topicSlug => {
              const href = `/${group.slug}/${topicSlug}`
              const isActive = pathname === href
              return (
                <Link
                  key={topicSlug}
                  href={href}
                  onClick={onLinkClick}
                  style={{
                    display: 'block',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    marginBottom: 1,
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    background: isActive ? 'var(--card-bg)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
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
      {/* Desktop sidebar */}
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

      {/* Mobile: hamburger */}
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

      {/* Mobile: backdrop */}
      {open && (
        <div
          className="mobile-only"
          style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile: slide-in panel */}
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
