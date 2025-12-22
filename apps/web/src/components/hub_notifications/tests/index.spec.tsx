import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubNotifications } from '../index'
import type { Notification } from '@/app/[userId]/types'
import type { TrackOption } from '@/components/hub_quick_actions/types'

jest.mock('@/components/hub_quick_actions/symptom_dialogue', () => ({
  SymptomDialogue: ({ open, initialTrackSlug }: { open: boolean; initialTrackSlug?: string }) => {
    if (!open) return null
    return <div data-testid='symptom-dialogue' data-track-slug={initialTrackSlug} />
  }
}))

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}))

const mockTracks: TrackOption[] = [
  {
    id: 'track-1',
    slug: 'pain',
    title: 'Pain',
    lastUpdatedAt: new Date().toISOString()
  },
  {
    id: 'track-2',
    slug: 'sleep',
    title: 'Sleep',
    lastUpdatedAt: new Date().toISOString()
  }
]

const defaultProps = {
  tracks: mockTracks,
  userId: 'user-123'
}

describe('HubNotifications', () => {
  beforeEach(() => {
    mockRefresh.mockClear()
    jest.clearAllMocks()
  })

  it('renders empty state when no notifications', () => {
    render(<HubNotifications notifications={[]} {...defaultProps} />)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(
      screen.getByText('You have no reminders right now. New suggestions will appear here.')
    ).toBeInTheDocument()
  })

  it('renders notifications when present', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    expect(screen.getByText('Test notification')).toBeInTheDocument()
  })

  it('renders dismiss button for each notification', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument()
  })

  it('renders CTA button when notification has ctaLabel', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: 'Add details'
      }
    ]

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Add details' })).toBeInTheDocument()
  })

  it('does not render CTA button when notification has no ctaLabel', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    // Only dismiss button should be present, no other action buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1) // Just the dismiss button
    expect(buttons[0]).toHaveAccessibleName('Dismiss notification')
  })

  it('renders separator between multiple notifications', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'First notification',
        message: 'Test message',
        ctaLabel: undefined
      },
      {
        id: '2',
        type: 'symptomReminder',
        title: 'Second notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    const { container } = render(
      <HubNotifications notifications={notifications} {...defaultProps} />
    )

    expect(screen.getByText('First notification')).toBeInTheDocument()
    expect(screen.getByText('Second notification')).toBeInTheDocument()
    // Separator should be present between items (uses data-slot="separator")
    const separators = container.querySelectorAll('[data-slot="separator"]')
    expect(separators).toHaveLength(1)
  })

  it('does not render separator after last notification', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'First notification',
        message: 'Test message',
        ctaLabel: undefined
      },
      {
        id: '2',
        type: 'symptomReminder',
        title: 'Second notification',
        message: 'Test message',
        ctaLabel: undefined
      },
      {
        id: '3',
        type: 'appointmentDetails',
        title: 'Third notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    const { container } = render(
      <HubNotifications notifications={notifications} {...defaultProps} />
    )

    // Should have n-1 separators for n notifications
    const separators = container.querySelectorAll('[data-slot="separator"]')
    expect(separators).toHaveLength(2)
  })

  it('clicking dismiss calls router.refresh on success', async () => {
    const user = userEvent.setup()
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined,
        entityId: 'event-1',
        notificationType: 'EVENT_MISSING_DETAILS'
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { ok: true } })
    })

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    expect(screen.getByText('Test notification')).toBeInTheDocument()

    const dismissButton = screen.getByLabelText('Dismiss notification')
    await user.click(dismissButton)

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('dismiss triggers network call', async () => {
    const user = userEvent.setup()
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined,
        entityId: 'event-1',
        notificationType: 'EVENT_MISSING_DETAILS'
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { ok: true } })
    })

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    const dismissButton = screen.getByLabelText('Dismiss notification')
    await user.click(dismissButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'EVENT_MISSING_DETAILS',
            entityId: 'event-1'
          })
        })
      )
    })
  })

  it('on failure, notification remains and router.refresh is not called', async () => {
    const user = userEvent.setup()
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined,
        entityId: 'event-1',
        notificationType: 'EVENT_MISSING_DETAILS'
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Failed to dismiss' })
    })

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    expect(screen.getByText('Test notification')).toBeInTheDocument()

    const dismissButton = screen.getByLabelText('Dismiss notification')
    await user.click(dismissButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Notification should still be visible after failed dismiss
    expect(screen.getByText('Test notification')).toBeInTheDocument()
    // router.refresh should NOT be called on failure
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('does not attempt to dismiss when notification is missing required fields', async () => {
    const user = userEvent.setup()
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Missing fields',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    global.fetch = jest.fn()

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    await user.click(screen.getByLabelText('Dismiss notification'))

    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
    expect(screen.getByText('Missing fields')).toBeInTheDocument()
  })

  it('opens SymptomDialogue when clicking symptomReminder CTA', async () => {
    const user = userEvent.setup()
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'symptomReminder',
        title: 'Log a symptom in Pain',
        message: 'Test message',
        ctaLabel: 'Log symptom',
        trackSlug: 'pain'
      }
    ]

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Log symptom' }))

    expect(screen.getByTestId('symptom-dialogue')).toHaveAttribute('data-track-slug', 'pain')
  })

  it('navigates to href when clicking appointmentDetails CTA', async () => {
    const user = userEvent.setup()
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Add details',
        message: 'Test message',
        ctaLabel: 'Add details',
        href: '#details'
      }
    ]

    render(<HubNotifications notifications={notifications} {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Add details' }))

    expect(window.location.hash).toBe('#details')
  })
})
