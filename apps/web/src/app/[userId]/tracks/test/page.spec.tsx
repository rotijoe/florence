import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import userEvent from '@testing-library/user-event'
import TracksPage from '../page'
import * as helpers from '../helpers'
import type { TrackResponse } from '@packages/types'

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn()
}))

jest.mock('../helpers', () => ({
  fetchTracks: jest.fn(),
  formatTrackDate: jest.fn((date) => new Date(date).toLocaleDateString()),
  buildAddEventHref: jest.fn((userId: string, trackSlug: string) => {
    return `/${userId}/tracks/${trackSlug}/new?returnTo=${encodeURIComponent(`/${userId}/tracks`)}`
  }),
  getTrackDescriptionFallback: jest.fn((description?: string | null) => {
    if (typeof description === 'string' && description.trim().length > 0) return description
    return 'Add a short description to make this track easier to scan.'
  }),
  getLastEventPlaceholder: jest.fn(() => ({
    label: 'Last event',
    detail: '—',
    hint: 'Event summaries are coming soon.'
  }))
}))

// Mock the TrackCreateDialog helpers (for isolation)
jest.mock('@/components/track_create_dialog/helpers', () => ({
  createTrack: jest.fn().mockResolvedValue({})
}))

describe('TracksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ userId: 'user-123' })
  })

  it('should display loading state while fetching tracks', () => {
    ;(helpers.fetchTracks as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    )

    render(<TracksPage />)

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('should display page header when data is loaded', async () => {
    const mockTracks: TrackResponse[] = []

    ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)

    render(<TracksPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your tracks/i })).toBeInTheDocument()
    })
  })

  it('should fetch tracks with userId from params', async () => {
    const mockTracks: TrackResponse[] = []

    ;(useParams as jest.Mock).mockReturnValue({ userId: 'user-456' })
    ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)

    render(<TracksPage />)

    await waitFor(() => {
      expect(helpers.fetchTracks).toHaveBeenCalledWith('user-456')
    })
  })

  it('should display health tracks when user has tracks', async () => {
    const mockTracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-123',
        title: 'Diabetes Management',
        slug: 'diabetes-management',
        description: 'Tracking blood sugar levels',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'track-2',
        userId: 'user-123',
        title: 'Physical Therapy',
        slug: 'physical-therapy',
        description: 'Post-surgery rehabilitation',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ]

    ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)

    render(<TracksPage />)

    await waitFor(() => {
      expect(screen.getByText('Diabetes Management')).toBeInTheDocument()
      expect(screen.getByText('Tracking blood sugar levels')).toBeInTheDocument()
      expect(screen.getByText('Physical Therapy')).toBeInTheDocument()
      expect(screen.getByText('Post-surgery rehabilitation')).toBeInTheDocument()
    })
  })

  it('should display empty state when user has no tracks', async () => {
    const mockTracks: TrackResponse[] = []

    ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)

    render(<TracksPage />)

    await waitFor(() => {
      expect(screen.getByText(/no tracks yet/i)).toBeInTheDocument()
    })
  })

  it('should display error state when fetch fails', async () => {
    ;(helpers.fetchTracks as jest.Mock).mockRejectedValue(new Error('Failed to fetch tracks'))

    render(<TracksPage />)

    await waitFor(
      () => {
        expect(screen.getByText(/couldn.*load.*tracks/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText('Failed to fetch tracks')).toBeInTheDocument()
  })

  it('should have clickable links to track detail pages', async () => {
    const mockTracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-123',
        title: 'Diabetes Management',
        slug: 'diabetes-management',
        description: 'Tracking blood sugar',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)

    render(<TracksPage />)

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /diabetes management/i })
      expect(link).toHaveAttribute('href', '/user-123/tracks/diabetes-management')
    })
  })

  it('should handle error when error is not an Error instance', async () => {
    ;(helpers.fetchTracks as jest.Mock).mockRejectedValue('String error')

    render(<TracksPage />)

    await waitFor(
      () => {
        expect(screen.getByText(/couldn.*load.*tracks/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
  })

  it('should render track without description', async () => {
    const mockTracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-123',
        title: 'Diabetes Management',
        slug: 'diabetes-management',
        description: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)

    render(<TracksPage />)

    await waitFor(() => {
      expect(screen.getByText('Diabetes Management')).toBeInTheDocument()
      expect(
        screen.getByText('Add a short description to make this track easier to scan.')
      ).toBeInTheDocument()
    })
  })

  describe('Create health track', () => {
    const mockTracks: TrackResponse[] = []

    beforeEach(() => {
      ;(helpers.fetchTracks as jest.Mock).mockResolvedValue(mockTracks)
    })

    it('should render create track button', async () => {
      render(<TracksPage />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /create track/i }).length).toBeGreaterThan(0)
      })
    })

    it('should open dialog when "Create track" button is clicked', async () => {
      const user = userEvent.setup()
      render(<TracksPage />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /create track/i }).length).toBeGreaterThan(0)
      })

      const createButtons = screen.getAllByRole('button', { name: /create track/i })
      await user.click(createButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/create new health track/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      })
    })

    it('should render dialog with form fields when opened', async () => {
      render(<TracksPage />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /create track/i }).length).toBeGreaterThan(0)
      })

      const createButtons = screen.getAllByRole('button', { name: /create track/i })
      await userEvent.click(createButtons[0])

      await waitFor(() => {
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument()
      })
    })

    it('should close dialog when cancel button is clicked', async () => {
      render(<TracksPage />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /create track/i }).length).toBeGreaterThan(0)
      })

      const createButtons = screen.getAllByRole('button', { name: /create track/i })
      await userEvent.click(createButtons[0])

      await waitFor(() => {
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/track name/i)).not.toBeInTheDocument()
      })
    })
  })
})
