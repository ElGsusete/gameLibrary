import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameCard } from './GameCard'

const mockGame = {
  id: '1',
  title: 'Test Game',
  year: 2023,
  coverImage: undefined,
  platform: ['PC'],
  addedAt: '2024-01-01T00:00:00.000Z',
  averageScore: 4.5,
  ratingCount: 10,
}

describe('GameCard', () => {
  it('renders game title', () => {
    render(
      <MemoryRouter>
        <GameCard game={mockGame} />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Game')).toBeInTheDocument()
  })
  it('renders year when provided', () => {
    render(
      <MemoryRouter>
        <GameCard game={mockGame} />
      </MemoryRouter>
    )
    expect(screen.getByText('2023')).toBeInTheDocument()
  })
  it('links to game detail page', () => {
    render(
      <MemoryRouter>
        <GameCard game={mockGame} />
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: /test game/i })
    expect(link).toHaveAttribute('href', '/games/1')
  })
})
