import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'
import { SearchEntry, NavGroup } from '@/types'

jest.mock('next/navigation', () => ({ usePathname: () => '/caching/caching' }))
jest.mock('next-themes', () => ({ useTheme: () => ({ theme: 'dark', setTheme: jest.fn() }) }))

const mockNavGroups: NavGroup[] = [
  { slug: 'caching', title: 'Caching', color: '#7c6aff', topics: ['caching', 'redis-vs-memcached'] },
  { slug: 'databases', title: 'Databases', color: '#2ecc71', topics: ['nosql-databases'] },
  { slug: 'networking', title: 'Networking', color: '#f39c12', topics: [] },
]

const mockEntries: SearchEntry[] = []

// Note: jsdom doesn't apply CSS, so both the desktop sidebar (hidden md:flex)
// and mobile panel (md:hidden) render and are queryable. Use getAllBy* for
// elements that appear in both panels.
describe('Sidebar', () => {
  it('renders the app logo', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getAllByText('SystemDesign.prep')[0]).toBeInTheDocument()
  })

  it('renders all group labels', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getAllByText('Caching').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Databases').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Networking').length).toBeGreaterThan(0)
  })

  it('renders topic links', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getAllByText('Redis Vs Memcached').length).toBeGreaterThan(0)
  })

  it('shows hamburger button on mobile via aria-label', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
  })
})
