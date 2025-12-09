import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActions } from '../index'
import { HUB_EVENT_QUICK_ACTIONS } from '../constants'

const mockTracks = [
  {
    slug: 'sleep-track',
    title: 'Sleep',
    lastUpdatedAt: new Date()
  },
  {
    slug: 'pain-track',
    title: 'Pain',
    lastUpdatedAt: new Date(Date.now() - 86400000)
  }
]

describe('HubQuickActions', () => {
  it('renders quick log section', () => {
    render(
      <HubQuickActions eventOptions={HUB_EVENT_QUICK_ACTIONS} tracks={mockTracks} userId='user-1' />
    )

    expect(screen.getByText('Quick log')).toBeInTheDocument()
    expect(screen.getByText('Capture what is happening in just a few taps.')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(
      <HubQuickActions eventOptions={HUB_EVENT_QUICK_ACTIONS} tracks={mockTracks} userId='user-1' />
    )

    expect(screen.getByText('Log symptom')).toBeInTheDocument()
  })

  it('opens symptom dialog when Log symptom button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <HubQuickActions eventOptions={HUB_EVENT_QUICK_ACTIONS} tracks={mockTracks} userId='user-1' />
    )

    const logSymptomButton = screen.getByText('Log symptom')
    await user.click(logSymptomButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Log symptom' })).toBeInTheDocument()
    expect(screen.getByText(/record a symptom/i)).toBeInTheDocument()
  })
})
