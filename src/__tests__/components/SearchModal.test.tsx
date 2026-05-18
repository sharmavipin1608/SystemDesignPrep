import { render, screen, fireEvent } from '@testing-library/react'
import { SearchModal } from '@/components/SearchModal'
import { SearchEntry } from '@/types'

const mockEntries: SearchEntry[] = [
  { topic: 'Caching', topicSlug: 'caching', group: 'Caching', groupSlug: 'caching', section: 'What is it?', slug: '/caching/caching', body: 'Stores data in memory for fast reads.' },
  { topic: 'Redis Vs Memcached', topicSlug: 'redis-vs-memcached', group: 'Caching', groupSlug: 'caching', section: 'Failure Modes', slug: '/caching/redis-vs-memcached', body: 'Redis can lose data on crash.' },
]

describe('SearchModal', () => {
  it('renders search input', () => {
    render(<SearchModal entries={mockEntries} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('shows no results when query is empty', () => {
    render(<SearchModal entries={mockEntries} />)
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('shows results when query matches', () => {
    render(<SearchModal entries={mockEntries} />)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'memory' } })
    expect(screen.getByText('What is it?')).toBeInTheDocument()
  })

  it('shows topic name alongside result', () => {
    render(<SearchModal entries={mockEntries} />)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'memory' } })
    expect(screen.getByText(/Caching/)).toBeInTheDocument()
  })
})
