import { render, screen } from '@testing-library/react'
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

// Mock DocumentUploadDialogue to avoid server-side import issues
jest.mock('@/components/hub_quick_actions/document_upload_dialogue', () => ({
  DocumentUploadDialogue: ({ open }: { open: boolean }) => (
    open ? <div role='dialog'>Document Upload Dialog</div> : null
  )
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

  it('has correct styling classes', () => {
    render(<HubQuickActionDocument tracks={mockTracks} hasTracks={true} userId='user-1' />)

    const button = screen.getByRole('button', { name: /document/i })
    expect(button).toHaveClass('justify-between', 'rounded-full', 'px-5', 'sm:w-auto')
  })
})

