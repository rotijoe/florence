import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActionSymptom } from '../index'
import type { TrackOption } from '@/components/hub_quick_actions/types'

const mockTracks: TrackOption[] = [
  {
    id: '1',
    slug: 'track-1',
    title: 'Track 1',
    lastUpdatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('HubQuickActionSymptom', () => {
  it('renders the button with correct text', () => {
    render(<HubQuickActionSymptom tracks={mockTracks} userId='user-1' />)

    const button = screen.getByRole('button', { name: /log symptom/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionSymptom tracks={mockTracks} userId='user-1' />)

    const button = screen.getByRole('button', { name: /log symptom/i })
    await user.click(button)

    // Dialog should be rendered (check for dialog content)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(<HubQuickActionSymptom tracks={mockTracks} userId='user-1' />)

    const button = screen.getByRole('button', { name: /log symptom/i })
    expect(button).toHaveClass('justify-between', 'rounded-full', 'px-5', 'sm:w-auto')
  })
})

