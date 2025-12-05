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
})
