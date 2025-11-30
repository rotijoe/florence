import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import userEvent from '@testing-library/user-event'
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
  createUserTrack: jest.fn(),
  formatTrackDate: jest.fn((date) => new Date(date).toLocaleDateString())
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    asChild,
    children
  }: {
    asChild?: boolean
    children: React.ReactNode
  }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <button>{children}</button>
  },
  DropdownMenuContent: ({ children, align }: { children: React.ReactNode; align?: string }) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect
  }: {
    children: React.ReactNode
    onSelect?: () => void
  }) => (
    <button onClick={onSelect} data-testid="dropdown-menu-item">
      {children}
    </button>
  )
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
    ;(helpers.fetchUserData as jest.Mock).mockRejectedValue(new Error('Failed to fetch user data'))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load your health tracks/i)).toBeInTheDocument()
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

  it('should display "User" when user name is null', async () => {
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
      expect(screen.getByText('Welcome, User')).toBeInTheDocument()
    })
  })

  it('should display "User" when user name is undefined', async () => {
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
      expect(screen.getByText('Welcome, User')).toBeInTheDocument()
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
      expect(screen.getByText(/failed to load your health tracks/i)).toBeInTheDocument()
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
          description: null,
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
      expect(screen.queryByText(/tracking/i)).not.toBeInTheDocument()
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

    it('should render dropdown menu with "Create health track" option when authenticated', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
        expect(screen.getByText(/create health track/i)).toBeInTheDocument()
      })
    })

    it('should open dialog when "Create health track" menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      })

      const menuItem = screen.getByRole('button', { name: /create health track/i })
      await user.click(menuItem)

      await waitFor(() => {
        expect(screen.getByText(/create new health track/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      })
    })

    it('should create track and refresh list on successful submission', async () => {
      const newTrack: UserWithTracks['tracks'][0] = {
        id: 'track-new',
        title: 'New Track',
        slug: 'new-track',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'user-123'
      }

      ;(helpers.createUserTrack as jest.Mock).mockResolvedValue(newTrack)
      ;(helpers.fetchUserData as jest.Mock)
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce({
          ...mockUserData,
          tracks: [newTrack]
        })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      })

      const menuItem = screen.getByRole('button', { name: /create health track/i })
      await userEvent.click(menuItem)

      await waitFor(() => {
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/track name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await userEvent.type(titleInput, 'New Track')
      await userEvent.type(descriptionInput, 'Test description')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(helpers.createUserTrack).toHaveBeenCalledWith('New Track', 'Test description')
        expect(helpers.fetchUserData).toHaveBeenCalledTimes(2)
        expect(screen.getByText('New Track')).toBeInTheDocument()
      })
    })

    it('should display error message when track creation fails', async () => {
      ;(helpers.createUserTrack as jest.Mock).mockRejectedValue(new Error('Failed to create track'))

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      })

      const menuItem = screen.getByRole('button', { name: /create health track/i })
      await userEvent.click(menuItem)

      await waitFor(() => {
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/track name/i)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await userEvent.type(titleInput, 'New Track')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to create track/i)).toBeInTheDocument()
      })
    })

    it('should close dialog when cancel button is clicked', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      })

      const menuItem = screen.getByRole('button', { name: /create health track/i })
      await userEvent.click(menuItem)

      await waitFor(() => {
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/track name/i)).not.toBeInTheDocument()
      })
    })

    it('should disable submit button while creating', async () => {
      let resolveCreate: (value: UserWithTracks['tracks'][0]) => void
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve
      })

      ;(helpers.createUserTrack as jest.Mock).mockReturnValue(createPromise)

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      })

      const menuItem = screen.getByRole('button', { name: /create health track/i })
      await userEvent.click(menuItem)

      await waitFor(() => {
        expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/track name/i)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await userEvent.type(titleInput, 'New Track')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })

      resolveCreate!({
        id: 'track-new',
        title: 'New Track',
        slug: 'new-track',
        description: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'user-123'
      })
    })
  })
})
