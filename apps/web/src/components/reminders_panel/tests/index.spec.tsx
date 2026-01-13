import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RemindersPanel } from '../index'
import type { Notification } from '@/app/[userId]/types'
import type { TrackOption } from '@/components/hub_quick_actions/types'

const mockOnSymptomSuccess = jest.fn()

jest.mock('@/components/hub_quick_actions/symptom_dialogue', () => ({
  SymptomDialogue: ({
    open,
    initialTrackSlug,
    onSuccess
  }: {
    open: boolean
    initialTrackSlug?: string
    onSuccess?: () => void
  }) => {
    if (!open) return null
    return (
      <div data-testid='symptom-dialogue' data-track-slug={initialTrackSlug}>
        <button onClick={onSuccess} data-testid='symptom-success-button'>
          Complete
        </button>
      </div>
    )
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

describe('RemindersPanel', () => {
  beforeEach(() => {
    mockRefresh.mockClear()
    jest.clearAllMocks()
  })

  it('renders empty state when no notifications', () => {
    render(<RemindersPanel notifications={[]} {...defaultProps} />)

    expect(screen.getByText('Reminders')).toBeInTheDocument()
    expect(
      screen.getByText('You have no reminders right now. New suggestions will appear here.')
    ).toBeInTheDocument()
  })

  it('renders Add event button in empty state when addEventHref is provided', () => {
    render(
      <RemindersPanel
        notifications={[]}
        {...defaultProps}
        addEventHref='/user-123/tracks/test-track/new?returnTo=%2Fuser-123%2Ftracks%2Ftest-track'
      />
    )

    expect(screen.getByRole('link', { name: /add event/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add event/i })).toHaveAttribute(
      'href',
      '/user-123/tracks/test-track/new?returnTo=%2Fuser-123%2Ftracks%2Ftest-track'
    )
  })

  it('does not render Add event button in empty state when addEventHref is not provided', () => {
    render(<RemindersPanel notifications={[]} {...defaultProps} />)

    expect(screen.queryByRole('link', { name: /add event/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add event/i })).not.toBeInTheDocument()
  })

  it('does not render Add event button when notifications exist', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    render(
      <RemindersPanel
        notifications={notifications}
        {...defaultProps}
        addEventHref='/user-123/tracks/test-track/new'
      />
    )

    expect(screen.queryByRole('link', { name: /add event/i })).not.toBeInTheDocument()
  })

  it('uses custom title prop', () => {
    render(<RemindersPanel notifications={[]} {...defaultProps} title='Custom Title' />)

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('uses custom description prop when notifications exist', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]

    render(
      <RemindersPanel
        notifications={notifications}
        {...defaultProps}
        description='Custom description text'
      />
    )

    expect(screen.getByText('Custom description text')).toBeInTheDocument()
  })

  it('uses custom emptyStateMessage prop', () => {
    render(
      <RemindersPanel
        notifications={[]}
        {...defaultProps}
        emptyStateMessage='No reminders available'
      />
    )

    expect(screen.getByText('No reminders available')).toBeInTheDocument()
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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    const { container } = render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    const { container } = render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Add details' }))

    expect(window.location.hash).toBe('#details')
  })

  it('calls handleSymptomSuccess when symptom dialogue completes successfully', async () => {
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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

    // Open symptom dialogue
    const logButton = screen.getByRole('button', { name: 'Log symptom' })
    await user.click(logButton)

    await waitFor(() => {
      expect(screen.getByTestId('symptom-dialogue')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Complete symptom logging
    const completeButton = screen.getByTestId('symptom-success-button')
    await user.click(completeButton)

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('handles handleSymptomSuccess when symptom dialogue completes', async () => {
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

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

    // Open symptom dialogue
    await user.click(screen.getByRole('button', { name: 'Log symptom' }))

    await waitFor(() => {
      expect(screen.getByTestId('symptom-dialogue')).toBeInTheDocument()
    })

    // Complete symptom logging
    const completeButton = screen.getByTestId('symptom-success-button')
    await user.click(completeButton)

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('handles notification without ctaLabel', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'symptomReminder',
        title: 'Test notification',
        message: 'Test message',
        ctaLabel: undefined,
        trackSlug: 'pain'
      }
    ]

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

    expect(screen.getByText('Test notification')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log symptom/i })).not.toBeInTheDocument()
  })

  it('handles appointmentDetails notification without href', async () => {
    const user = userEvent.setup()
    const originalHash = window.location.hash
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Add details',
        message: 'Test message',
        ctaLabel: 'Add details',
        href: undefined
      }
    ]

    render(<RemindersPanel notifications={notifications} {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Add details' })
    await user.click(button)

    // Should not navigate if href is undefined - restore original hash
    window.location.hash = originalHash
  })
})

