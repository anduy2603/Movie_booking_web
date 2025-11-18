/**
 * Test cho MovieCard component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MovieCard from '../../components/MovieCard'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

beforeEach(() => {
  mockNavigate.mockClear()
})

describe('MovieCard', () => {
  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    description: 'A test movie description',
    genre: 'Action',
    duration: 120,
    poster_url: 'https://example.com/poster.jpg',
    release_date: '2024-01-01',
  }

  it('renders movie title', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('renders movie genre', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    
    // Genre text is part of a larger text: "2024 · Action · 2h 0m"
    // Find the <p> element that contains "Action" text
    const genreElement = screen.getByText((content, element) => {
      return element?.tagName?.toLowerCase() === 'p' && 
             (element?.textContent?.includes('Action') ?? false)
    })
    expect(genreElement).toBeInTheDocument()
    expect(genreElement.textContent).toContain('Action')
  })

  it('renders movie duration', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    
    // Duration is formatted as "2h 0m" from 120 minutes
    expect(screen.getByText(/2h 0m/)).toBeInTheDocument()
  })

  it('renders movie poster image', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    
    const image = screen.getByAltText('Test Movie')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/poster.jpg')
  })

  it('handles missing poster URL', () => {
    const movieWithoutPoster = {
      ...mockMovie,
      poster_url: null,
    }
    
    render(
      <BrowserRouter>
        <MovieCard movie={movieWithoutPoster} />
      </BrowserRouter>
    )
    
    // Component should still render without crashing
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })
})

