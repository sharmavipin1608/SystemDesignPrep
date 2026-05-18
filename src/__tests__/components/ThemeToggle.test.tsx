import { render, screen } from '@testing-library/react'
import { ThemeToggle } from '@/components/ThemeToggle'

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: jest.fn() }),
}))

describe('ThemeToggle', () => {
  it('renders a toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
