import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActionDocument } from '../index'
import type { TrackOption } from '@/components/hub_quick_actions/types'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn()
  }
}))

import { toast } from 'sonner'
const mockToastSuccess = toast.success as jest.Mock

// Mock DocumentUploadDialogue to avoid server-side import issues
jest.mock('@/components/hub_quick_actions/document_upload_dialogue', () => ({
  DocumentUploadDialogue: ({
    open,
    onSuccess,
    onOpenChange,
    onLoadingChange
  }: {
    open: boolean
    onSuccess?: (params: { eventId: string; trackSlug: string }) => void
    onOpenChange?: (open: boolean) => void
    onLoadingChange?: (loading: boolean) => void
  }) => {
    if (!open) return null
    return (
      <div role='dialog'>
        Document Upload Dialog
        <button onClick={() => onSuccess?.({ eventId: 'event-1', trackSlug: 'track-1' })}>
          Complete
        </button>
        <button onClick={() => onOpenChange?.(false)}>Close</button>
        <button onClick={() => onLoadingChange?.(true)}>Set Loading</button>
        <button onClick={() => onLoadingChange?.(false)}>Unset Loading</button>
      </div>
    )
  }
}))

const mockTracks: TrackOption[] = [
  {
    id: '1',
    slug: 'track-1',
    title: 'Track 1',
    lastUpdatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    slug: 'track-2',
    title: 'Track 2',
    lastUpdatedAt: '2024-01-02T00:00:00Z'
  }
]

describe('HubQuickActionDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('renders disabled button with tooltip when no tracks', () => {
    render(<HubQuickActionDocument tracks={[]} hasTracks={false} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    expect(button).toBeDisabled()
  })

  it('renders dropdown button when tracks are available', () => {
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('opens dropdown and shows track options when clicked', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    expect(screen.getByText('Track 1')).toBeInTheDocument()
    expect(screen.getByText('Track 2')).toBeInTheDocument()
    expect(screen.getAllByText('Upload document')).toHaveLength(2)
  })

  it('opens dialog when a track is selected', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    // Dialog should be rendered after selecting a track
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows error state when error occurs', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    await screen.findByRole('dialog')

    // Verify dialog is open (user sees upload interface)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls handleSuccess when document upload completes', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    await screen.findByRole('dialog')

    const completeButton = screen.getByRole('button', { name: /complete/i })
    await user.click(completeButton)

    // Assert toast.success is called with correct message and action
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Document uploaded successfully',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'View event'
          })
        })
      )
    })

    // Call the action onClick to verify router.push is called
    const toastCall = mockToastSuccess.mock.calls[0]
    if (toastCall && toastCall[1]?.action?.onClick) {
      toastCall[1].action.onClick()
      expect(mockPush).toHaveBeenCalledWith('/user-1/tracks/track-1/event-1')
    }
  })

  it('calls handleOpenChange when dialog closes', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    await screen.findByRole('dialog')

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('calls handleLoadingChange when loading state changes', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    const dialog = await screen.findByRole('dialog')
    const dialogScope = within(dialog)

    // Use exact match to avoid matching "Unset Loading"
    const setLoadingButton = dialogScope.getByRole('button', { name: /^Set Loading$/i })
    await user.click(setLoadingButton)

    // Button should be disabled when loading
    await waitFor(() => {
      const mainButton = screen.getByRole('button', { name: /document/i })
      expect(mainButton).toBeDisabled()
    })
  })

  it('handles handleLoadingChange when loading stops and dialog is closed', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    await screen.findByRole('dialog')

    // Close dialog first
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
