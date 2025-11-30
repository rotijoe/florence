import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackHeader } from '../index'
import type { TrackHeaderProps } from '../types'
import type { TrackResponse } from '@packages/types'

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
    onSelect,
    disabled
  }: {
    children: React.ReactNode
    onSelect?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onSelect} disabled={disabled} data-testid="dropdown-menu-item">
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} type={type} {...props}>
      {children}
    </button>
  )
}))

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
    trackSlug: 'test-track',
    onCreateEvent: jest.fn()
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

  it('renders "Delete track" menu item as disabled placeholder', () => {
    render(<TrackHeader {...defaultProps} />)

    const deleteItem = screen.getByText('Delete track')
    expect(deleteItem).toBeInTheDocument()
    expect(deleteItem.closest('button')).toBeDisabled()
  })

  it('renders "Export track data" menu item as disabled placeholder', () => {
    render(<TrackHeader {...defaultProps} />)

    const exportItem = screen.getByText('Export track data')
    expect(exportItem).toBeInTheDocument()
    expect(exportItem.closest('button')).toBeDisabled()
  })

  it('calls onCreateEvent when "Create event" is clicked', async () => {
    const user = userEvent.setup()
    const onCreateEvent = jest.fn()
    render(<TrackHeader {...defaultProps} onCreateEvent={onCreateEvent} />)

    const createEventItem = screen.getByText('Create event')
    await user.click(createEventItem)

    expect(onCreateEvent).toHaveBeenCalled()
  })

  it('does not call onCreateEvent when disabled items are clicked', async () => {
    const user = userEvent.setup()
    const onCreateEvent = jest.fn()
    render(<TrackHeader {...defaultProps} onCreateEvent={onCreateEvent} />)

    const deleteItem = screen.getByText('Delete track')
    const exportItem = screen.getByText('Export track data')

    await user.click(deleteItem)
    await user.click(exportItem)

    expect(onCreateEvent).not.toHaveBeenCalled()
  })

  it('renders separator between create event and other actions', () => {
    render(<TrackHeader {...defaultProps} />)

    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument()
  })
})
