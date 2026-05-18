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

describe('Sidebar', () => {
  it('renders the app logo', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getByText('SystemDesign.prep')).toBeInTheDocument()
  })

  it('renders all group labels', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getAllByText('Caching')).toBeTruthy()
    expect(screen.getByText('Databases')).toBeInTheDocument()
    expect(screen.getByText('Networking')).toBeInTheDocument()
  })

  it('renders topic links', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getByText('Redis Vs Memcached')).toBeInTheDocument()
  })

  it('shows hamburger button on mobile via aria-label', () => {
    render(<Sidebar navGroups={mockNavGroups} searchEntries={mockEntries} />)
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
  })
})
