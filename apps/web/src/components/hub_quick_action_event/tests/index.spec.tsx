import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActionEvent } from '../index'
import type { TrackOption } from '@/components/hub_quick_actions/types'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
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

describe('HubQuickActionEvent', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders disabled button with tooltip when no tracks', () => {
    render(<HubQuickActionEvent tracks={[]} userId='user-1' hasTracks={false} />)

    const button = screen.getByRole('button', { name: /event/i })
    expect(button).toBeDisabled()
  })

  it('renders dropdown button when tracks are available', () => {
    render(<HubQuickActionEvent tracks={mockTracks} userId='user-1' hasTracks={true} />)

    const button = screen.getByRole('button', { name: /event/i })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('opens dropdown and shows track options when clicked', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionEvent tracks={mockTracks} userId='user-1' hasTracks={true} />)

    const button = screen.getByRole('button', { name: /event/i })
    await user.click(button)

    expect(screen.getByText('Track 1')).toBeInTheDocument()
    expect(screen.getByText('Track 2')).toBeInTheDocument()
    expect(screen.getAllByText('Create new event')).toHaveLength(2)
  })

  it('navigates to new event page when a track is selected', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionEvent tracks={mockTracks} userId='user-1' hasTracks={true} />)

    const button = screen.getByRole('button', { name: /event/i })
    await user.click(button)

    const track1Option = screen.getByText('Track 1').closest('[role="menuitem"]')
    if (track1Option) {
      await user.click(track1Option)
    }

    expect(mockPush).toHaveBeenCalledWith('/user-1/tracks/track-1/new?returnTo=%2Fuser-1')
  })

  it('has correct styling classes', () => {
    render(<HubQuickActionEvent tracks={mockTracks} userId='user-1' hasTracks={true} />)

    const button = screen.getByRole('button', { name: /event/i })
    expect(button).toHaveClass('justify-between', 'rounded-full', 'px-5', 'sm:w-auto')
  })
})

