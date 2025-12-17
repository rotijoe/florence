import { render, screen } from '@testing-library/react'
import { TrackRemindersPanel } from '../index'
import type { Notification } from '@/app/[userId]/types'

describe('TrackRemindersPanel', () => {
  it('renders an empty state when there are no reminders', () => {
    render(<TrackRemindersPanel notifications={[]} />)

    expect(screen.getByText(/^reminders$/i)).toBeInTheDocument()
    expect(screen.getByText(/no reminders/i)).toBeInTheDocument()
  })

  it('renders reminders with titles and messages', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'symptomReminder',
        title: 'Log a symptom in Pain',
        message: 'A quick check‑in helps you spot patterns.',
        ctaLabel: 'Log symptom',
        trackSlug: 'pain'
      },
      {
        id: '2',
        type: 'appointmentDetails',
        title: 'Add details to “GP follow‑up”',
        message: 'Capture the key points while they are still fresh.',
        ctaLabel: 'Add details',
        href: '/user-1/tracks/pain/event-123'
      }
    ]

    render(<TrackRemindersPanel notifications={notifications} />)

    expect(screen.getByText('Log a symptom in Pain')).toBeInTheDocument()
    expect(screen.getByText(/check‑in helps/i)).toBeInTheDocument()

    expect(screen.getByText(/add details to/i)).toBeInTheDocument()
    expect(screen.getByText(/capture the key points/i)).toBeInTheDocument()
  })
})


