'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-[30px] h-[17px]" />

  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 30, height: 17, borderRadius: 9, border: 'none', cursor: 'pointer',
        background: 'var(--border)', position: 'relative', flexShrink: 0,
      }}
    >
      <span style={{
        width: 11, height: 11, borderRadius: '50%',
        background: 'var(--accent)', position: 'absolute', top: 3,
        left: isDark ? 3 : 16, transition: 'left 0.2s',
      }} />
    </button>
  )
}
