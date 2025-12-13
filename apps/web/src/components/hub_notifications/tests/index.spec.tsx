import { render, screen } from '@testing-library/react'
import { HubNotifications } from '../index'
import type { Notification } from '@/app/[userId]/types'

describe('HubNotifications', () => {
  it('renders empty state when no notifications', () => {
    render(<HubNotifications notifications={[]} />)

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

    render(<HubNotifications notifications={notifications} />)

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

    render(<HubNotifications notifications={notifications} />)

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

    render(<HubNotifications notifications={notifications} />)

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

    render(<HubNotifications notifications={notifications} />)

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

    const { container } = render(<HubNotifications notifications={notifications} />)

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

    const { container } = render(<HubNotifications notifications={notifications} />)

    // Should have n-1 separators for n notifications
    const separators = container.querySelectorAll('[data-slot="separator"]')
    expect(separators).toHaveLength(2)
  })
})
