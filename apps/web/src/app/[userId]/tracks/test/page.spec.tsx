import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import userEvent from '@testing-library/user-event'
import DashboardPage from '../page'
import { useSession } from '@/lib/auth_client'
import * as helpers from '../helpers'
import type { UserWithTracks } from '../types'

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth_client', () => ({
  useSession: jest.fn()
}))

jest.mock('../helpers', () => ({
  fetchUserData: jest.fn(),
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

describe('DashboardPage', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should redirect to home when user is not authenticated', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('should display loading state while fetching user data', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    )

    render(<DashboardPage />)

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('should display user name when authenticated and data is loaded', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: []
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your tracks/i })).toBeInTheDocument()
    })
  })

  it('should display health tracks when user has tracks', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: [
        {
          id: 'track-1',
          title: 'Diabetes Management',
          slug: 'diabetes-management',
          description: 'Tracking blood sugar levels',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userId: 'user-123'
        },
        {
          id: 'track-2',
          title: 'Physical Therapy',
          slug: 'physical-therapy',
          description: 'Post-surgery rehabilitation',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          userId: 'user-123'
        }
      ]
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Diabetes Management')).toBeInTheDocument()
      expect(screen.getByText('Tracking blood sugar levels')).toBeInTheDocument()
      expect(screen.getByText('Physical Therapy')).toBeInTheDocument()
      expect(screen.getByText('Post-surgery rehabilitation')).toBeInTheDocument()
    })
  })

  it('should display empty state when user has no tracks', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: []
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/no tracks yet/i)).toBeInTheDocument()
    })
  })

  it('should display error state when fetch fails', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockRejectedValue(new Error('Failed to fetch user data'))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/couldn’t load your tracks/i)).toBeInTheDocument()
    })
  })

  it('should have clickable links to track detail pages', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: [
        {
          id: 'track-1',
          title: 'Diabetes Management',
          slug: 'diabetes-management',
          description: 'Tracking blood sugar',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userId: 'user-123'
        }
      ]
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /diabetes management/i })
      expect(link).toHaveAttribute('href', '/user-123/tracks/diabetes-management')
    })
  })

  it('should render page header when user name is null', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: null,
      email: 'john@example.com',
      tracks: []
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: null, email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your tracks/i })).toBeInTheDocument()
    })
  })

  it('should render page header when user name is undefined', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: undefined as unknown as null,
      email: 'john@example.com',
      tracks: []
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: undefined, email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your tracks/i })).toBeInTheDocument()
    })
  })

  it('should handle error when error is not an Error instance', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockRejectedValue('String error')

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/couldn’t load your tracks/i)).toBeInTheDocument()
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })

  it('should not render when session is pending', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: true,
      error: null
    })

    const { container } = render(<DashboardPage />)

    expect(container.firstChild).toBeNull()
  })

  it('should not render when session is null and not pending', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
      error: null
    })

    const { container } = render(<DashboardPage />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('should render track without description', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: [
        {
          id: 'track-1',
          title: 'Diabetes Management',
          slug: 'diabetes-management',
          description: undefined,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userId: 'user-123'
        }
      ]
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
      },
      isPending: false,
      error: null
    })
    ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Diabetes Management')).toBeInTheDocument()
      expect(
        screen.getByText('Add a short description to make this track easier to scan.')
      ).toBeInTheDocument()
    })
  })

  describe('Create health track', () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: []
    }

    beforeEach(() => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
        },
        isPending: false,
        error: null
      })
      ;(helpers.fetchUserData as jest.Mock).mockResolvedValue(mockUserData)
    })

    it('should render create track button when authenticated', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /create track/i }).length).toBeGreaterThan(0)
      })
    })

    it('should open dialog when "Create track" button is clicked', async () => {
      const user = userEvent.setup()
      render(<DashboardPage />)

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
      render(<DashboardPage />)

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
      render(<DashboardPage />)

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
