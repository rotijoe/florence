import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import DashboardPage from '../page'
import { useSession } from '@/lib/auth_client'
import * as helpers from '../helpers'
import type { UserWithTracks } from '../types'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth_client', () => ({
  useSession: jest.fn()
}))

jest.mock('../helpers', () => ({
  fetchUserData: jest.fn(),
  formatTrackDate: jest.fn((date) => new Date(date).toLocaleDateString())
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

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
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
      expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument()
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
          description: 'Tracking blood sugar levels',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userId: 'user-123'
        },
        {
          id: 'track-2',
          title: 'Physical Therapy',
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
      expect(
        screen.getByText('Tracking blood sugar levels')
      ).toBeInTheDocument()
      expect(screen.getByText('Physical Therapy')).toBeInTheDocument()
      expect(
        screen.getByText('Post-surgery rehabilitation')
      ).toBeInTheDocument()
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
      expect(screen.getByText(/no health tracks yet/i)).toBeInTheDocument()
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
    ;(helpers.fetchUserData as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch user data')
    )

    render(<DashboardPage />)

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load your health tracks/i)
      ).toBeInTheDocument()
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
      expect(link).toHaveAttribute('href', '/dashboard/tracks/track-1')
    })
  })
})
