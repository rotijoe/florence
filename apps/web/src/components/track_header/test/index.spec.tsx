import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackHeader } from '../index'
import type { TrackHeaderProps } from '../types'
import type { TrackResponse } from '@packages/types'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

jest.mock('@/app/[userId]/tracks/[trackSlug]/actions', () => ({
  deleteTrackAction: jest.fn()
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dropdown-menu'>{children}</div>
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
    <div data-testid='dropdown-content' data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
    disabled
  }: {
    children: React.ReactNode
    onSelect?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onSelect} disabled={disabled} data-testid='dropdown-menu-item'>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid='dropdown-separator' />
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} type={type} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => (open ? <div role='dialog'>{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

import { deleteTrackAction } from '@/app/[userId]/tracks/[trackSlug]/actions'

const mockDeleteTrackAction = deleteTrackAction as jest.MockedFunction<typeof deleteTrackAction>

describe('TrackHeader', () => {
  const mockTrack: TrackResponse = {
    id: 'track-1',
    slug: 'test-track',
    name: 'Test Track',
    createdAt: '2024-01-01T00:00:00.000Z'
  }

  const defaultProps: TrackHeaderProps = {
    track: mockTrack,
    userId: 'user-1',
    trackSlug: 'test-track'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders track name as heading', () => {
    render(<TrackHeader {...defaultProps} />)

    expect(screen.getByText('Test Track')).toBeInTheDocument()
  })

  it('renders dropdown menu', () => {
    render(<TrackHeader {...defaultProps} />)

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
  })

  it('renders "Create event" menu item', () => {
    render(<TrackHeader {...defaultProps} />)

    expect(screen.getByText('Create event')).toBeInTheDocument()
  })

  it('renders "Delete track" menu item as enabled', () => {
    render(<TrackHeader {...defaultProps} />)

    const deleteItem = screen.getByText('Delete track')
    expect(deleteItem).toBeInTheDocument()
    expect(deleteItem.closest('button')).not.toBeDisabled()
  })

  it('renders "Export track data" menu item as disabled placeholder', () => {
    render(<TrackHeader {...defaultProps} />)

    const exportItem = screen.getByText('Export track data')
    expect(exportItem).toBeInTheDocument()
    expect(exportItem.closest('button')).toBeDisabled()
  })

  it('navigates to new event page when "Create event" is clicked', async () => {
    const user = userEvent.setup()
    render(<TrackHeader {...defaultProps} />)

    const createEventItem = screen.getByText('Create event')
    await user.click(createEventItem)

    expect(mockPush).toHaveBeenCalledWith(
      `/user-1/tracks/test-track/new?returnTo=${encodeURIComponent('/user-1/tracks/test-track')}`
    )
  })

  it('does not navigate when export item is clicked', async () => {
    const user = userEvent.setup()
    render(<TrackHeader {...defaultProps} />)

    const exportItem = screen.getByText('Export track data')

    await user.click(exportItem)

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders separator between create event and other actions', () => {
    render(<TrackHeader {...defaultProps} />)

    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument()
  })

  describe('delete track', () => {
    beforeEach(() => {
      mockDeleteTrackAction.mockClear()
    })

    it('opens confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup()
      render(<TrackHeader {...defaultProps} />)

      const deleteItem = screen.getByText('Delete track')
      await user.click(deleteItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
    })

    it('calls deleteTrackAction when delete is confirmed', async () => {
      const user = userEvent.setup()
      mockDeleteTrackAction.mockResolvedValue({})

      render(<TrackHeader {...defaultProps} />)

      const deleteItem = screen.getByText('Delete track')
      await user.click(deleteItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /^delete$/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteTrackAction).toHaveBeenCalledWith('user-1', 'test-track')
      })
    })

    it('shows toast error when delete fails', async () => {
      const user = userEvent.setup()
      const toast = (await import('sonner')).toast
      mockDeleteTrackAction.mockResolvedValue({ error: 'Failed to delete track' })

      render(<TrackHeader {...defaultProps} />)

      const deleteItem = screen.getByText('Delete track')
      await user.click(deleteItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /^delete$/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete track')
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TrackHeader {...defaultProps} />)

      const deleteItem = screen.getByText('Delete track')
      await user.click(deleteItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      expect(mockDeleteTrackAction).not.toHaveBeenCalled()
    })
  })
})
