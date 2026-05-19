import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Sidebar } from '@/components/Sidebar'
import { buildSearchIndex } from '@/lib/search-index'
import { getNavGroups } from '@/lib/groups'

export const metadata: Metadata = {
  title: 'SystemDesign.prep',
  description: 'System design interview study guide',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [searchEntries, navGroups] = await Promise.all([buildSearchIndex(), Promise.resolve(getNavGroups())])

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Sidebar navGroups={navGroups} searchEntries={searchEntries} />
          <main className="main-content" style={{ minHeight: '100vh' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
