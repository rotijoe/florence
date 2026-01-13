import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActionTrack } from '../index'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn()
  }
}))

jest.mock('@/components/track_create_dialog', () => ({
  TrackCreateDialog: ({
    open,
    onLoadingChange,
    onOpenChange,
    onSuccess
  }: {
    open: boolean
    onLoadingChange?: (loading: boolean) => void
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
  }) => {
    if (!open) return null
    return (
      <div role='dialog'>
        Track Create Dialog
        <button onClick={() => onLoadingChange?.(true)}>Set Loading</button>
        <button onClick={() => onLoadingChange?.(false)}>Unset Loading</button>
        <button onClick={() => onOpenChange?.(false)}>Close</button>
        <button onClick={() => onSuccess?.()}>Success</button>
      </div>
    )
  }
}))

describe('HubQuickActionTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the button with correct text', () => {
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('shows loading state when dialog triggers loading', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Trigger loading state - use exact match to avoid matching "Unset Loading"
    const setLoadingButton = screen.getByRole('button', { name: /^Set Loading$/i })
    await user.click(setLoadingButton)

    // Verify loading state is visible (user sees spinner and button is disabled)
    await waitFor(() => {
      const trackButton = screen.getByRole('button', { name: /track/i })
      expect(trackButton).toBeDisabled()
    })
  })

  it('handles loading change when dialog closes', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Set loading, then close dialog - use exact match to avoid matching "Unset Loading"
    const setLoadingButton = screen.getByRole('button', { name: /^Set Loading$/i })
    await user.click(setLoadingButton)

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('handles success callback', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = jest.fn()
    render(<HubQuickActionTrack userId='user-1' onSuccess={mockOnSuccess} />)

    const button = screen.getByRole('button', { name: /track/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const successButton = screen.getByRole('button', { name: /success/i })
    await user.click(successButton)

    // Dialog should close after success
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
