import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubHealthTracks } from '../index'
import type { HealthTrackSummary } from '@/app/[userId]/types'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

// Mock TrackCreateDialog
jest.mock('@/components/track_create_dialog', () => ({
  TrackCreateDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    if (!open) return null
    return (
      <div data-testid='track-create-dialog'>
        <h2>Create new health track</h2>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    )
  }
}))

// Mock useRouter
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}))

describe('HubHealthTracks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no tracks', () => {
    render(<HubHealthTracks userId='user-123' tracks={[]} />)

    expect(screen.getByText('Health tracks')).toBeInTheDocument()
    expect(
      screen.getByText('When you create health tracks they will appear here.')
    ).toBeInTheDocument()
  })

  it('renders tracks when present', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: '1',
        title: 'Test Track',
        description: 'Test description',
        lastUpdatedLabel: 'Updated today',
        slug: 'test-track',
        lastUpdatedAt: new Date()
      }
    ]

    render(<HubHealthTracks userId='user-123' tracks={tracks} />)

    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Updated today')).toBeInTheDocument()
  })

  it('renders add button when tracks exist', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: '1',
        title: 'Test Track',
        description: null,
        lastUpdatedLabel: 'Updated today',
        slug: 'test-track',
        lastUpdatedAt: new Date()
      }
    ]

    render(<HubHealthTracks userId='user-123' tracks={tracks} />)

    expect(screen.getByLabelText('Add health track')).toBeInTheDocument()
  })

  it('renders track cards as links with correct href', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: 'track-1',
        title: 'Sleep Track',
        description: 'Track sleep patterns',
        lastUpdatedLabel: 'Updated today',
        slug: 'sleep-track',
        lastUpdatedAt: new Date()
      },
      {
        id: 'track-2',
        title: 'Pain Track',
        description: null,
        lastUpdatedLabel: 'Updated yesterday',
        slug: 'pain-track',
        lastUpdatedAt: new Date()
      }
    ]

    render(<HubHealthTracks userId='user-456' tracks={tracks} />)

    const sleepLink = screen.getByText('Sleep Track').closest('a')
    expect(sleepLink).toHaveAttribute('href', '/user-456/tracks/sleep-track')

    const painLink = screen.getByText('Pain Track').closest('a')
    expect(painLink).toHaveAttribute('href', '/user-456/tracks/pain-track')
  })

  it('opens create dialog when plus button is clicked', async () => {
    const user = userEvent.setup()
    const tracks: HealthTrackSummary[] = [
      {
        id: '1',
        title: 'Test Track',
        description: null,
        lastUpdatedLabel: 'Updated today',
        slug: 'test-track',
        lastUpdatedAt: new Date()
      }
    ]

    render(<HubHealthTracks userId='user-123' tracks={tracks} />)

    expect(screen.queryByTestId('track-create-dialog')).not.toBeInTheDocument()

    const plusButton = screen.getByLabelText('Add health track')
    await user.click(plusButton)

    expect(screen.getByTestId('track-create-dialog')).toBeInTheDocument()
    expect(screen.getByText('Create new health track')).toBeInTheDocument()
  })

  it('opens create dialog when empty state CTA button is clicked', async () => {
    const user = userEvent.setup()

    render(<HubHealthTracks userId='user-123' tracks={[]} />)

    expect(screen.queryByTestId('track-create-dialog')).not.toBeInTheDocument()

    const createButton = screen.getByRole('button', { name: /create a health track/i })
    await user.click(createButton)

    expect(screen.getByTestId('track-create-dialog')).toBeInTheDocument()
    expect(screen.getByText('Create new health track')).toBeInTheDocument()
  })
})
