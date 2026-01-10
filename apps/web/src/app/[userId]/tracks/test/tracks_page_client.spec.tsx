import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import userEvent from '@testing-library/user-event'
import { TracksPageClient } from '../tracks_page_client'
import type { TrackResponse } from '@packages/types'

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/components/track_create_dialog', () => ({
  TrackCreateDialog: ({
    userId,
    open,
    onOpenChange,
    onSuccess
  }: {
    userId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
  }) => (
    <div data-testid='track-create-dialog' data-open={open} data-user-id={userId}>
      {open && (
        <>
          <div>Create new health track</div>
          <label>
            Track name
            <input type='text' />
          </label>
          <label>
            Description
            <textarea />
          </label>
          <button onClick={() => onOpenChange(false)}>Cancel</button>
          <button
            onClick={() => {
              onSuccess?.()
              onOpenChange(false)
            }}
          >
            Create
          </button>
        </>
      )}
    </div>
  )
}))

jest.mock('@/components/track_tile', () => ({
  TrackTiles: ({ userId, tracks }: { userId: string; tracks: TrackResponse[] }) => (
    <div data-testid='track-tiles' data-user-id={userId} data-tracks-count={tracks.length}>
      {tracks.map((track) => (
        <a key={track.id} href={`/${userId}/tracks/${track.slug}`}>
          {track.title}
        </a>
      ))}
    </div>
  )
}))

describe('TracksPageClient', () => {
  const mockRouter = {
    refresh: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render page header', () => {
    const tracks: TrackResponse[] = []

    render(<TracksPageClient userId='user-123' tracks={tracks} />)

    expect(screen.getByRole('heading', { name: /your tracks/i })).toBeInTheDocument()
  })

  it('should render empty state when no tracks', () => {
    const tracks: TrackResponse[] = []

    render(<TracksPageClient userId='user-123' tracks={tracks} />)

    expect(screen.getByText(/no tracks yet/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /create track/i }).length).toBeGreaterThan(0)
  })

  it('should render tracks when tracks exist', () => {
    const tracks: TrackResponse[] = [
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

    render(<TracksPageClient userId='user-123' tracks={tracks} />)

    expect(screen.getByTestId('track-tiles')).toBeInTheDocument()
    expect(screen.getByText('Diabetes Management')).toBeInTheDocument()
  })

  it('should open dialog when create track button is clicked', async () => {
    const user = userEvent.setup()
    const tracks: TrackResponse[] = []

    render(<TracksPageClient userId='user-123' tracks={tracks} />)

    const createButtons = screen.getAllByRole('button', { name: /create track/i })
    await user.click(createButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/create new health track/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
    })
  })

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    const tracks: TrackResponse[] = []

    render(<TracksPageClient userId='user-123' tracks={tracks} />)

    const createButtons = screen.getAllByRole('button', { name: /create track/i })
    await user.click(createButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/create new health track/i)).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText(/create new health track/i)).not.toBeInTheDocument()
    })
  })

  it('should call router.refresh() and close dialog on successful track creation', async () => {
    const user = userEvent.setup()
    const tracks: TrackResponse[] = []

    render(<TracksPageClient userId='user-123' tracks={tracks} />)

    const createButtons = screen.getAllByRole('button', { name: /create track/i })
    await user.click(createButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/create new health track/i)).toBeInTheDocument()
    })

    const createButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(mockRouter.refresh).toHaveBeenCalled()
      expect(screen.queryByText(/create new health track/i)).not.toBeInTheDocument()
    })
  })

  it('should pass userId to TrackTiles', () => {
    const tracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-123',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    render(<TracksPageClient userId='user-456' tracks={tracks} />)

    const trackTiles = screen.getByTestId('track-tiles')
    expect(trackTiles).toHaveAttribute('data-user-id', 'user-456')
  })
})

