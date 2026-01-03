import { render, screen } from '@testing-library/react'
import { UpcomingEventsPanel } from '../index'
import type { UpcomingEvent } from '../types'

describe('UpcomingEventsPanel', () => {
  it('renders empty state when no events', () => {
    render(
      <UpcomingEventsPanel
        title='Upcoming appointments'
        upcomingEvents={[]}
        emptyStateMessage='No events found'
      />
    )

    expect(screen.getByText('Upcoming appointments')).toBeInTheDocument()
    expect(screen.getByText('No events found')).toBeInTheDocument()
  })

  it('renders events with date box, time and title', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 30, 0, 0)
    const events: UpcomingEvent[] = [
      {
        id: '1',
        title: 'GP Appointment',
        datetime: tomorrow,
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(<UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={events} />)

    // Date box shows TOM
    expect(screen.getByText('TOM')).toBeInTheDocument()
    // Time shows above title
    expect(screen.getByText('14:30')).toBeInTheDocument()
    // Title
    expect(screen.getByText('GP Appointment')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /GP Appointment/i })
    expect(link).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')
  })

  it('renders each event as a link to the event detail page', () => {
    const date1 = new Date()
    date1.setDate(date1.getDate() + 3) // 3 days from now
    const date2 = new Date()
    date2.setDate(date2.getDate() + 4) // 4 days from now
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: date1,
        href: '/user-1/tracks/sleep/event-1'
      },
      {
        id: 'event-2',
        title: 'Second Appointment',
        datetime: date2,
        href: '/user-1/tracks/pain/event-2'
      }
    ]

    render(<UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={events} />)

    const firstLink = screen.getByRole('link', { name: /First Appointment/i })
    expect(firstLink).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')

    const secondLink = screen.getByRole('link', { name: /Second Appointment/i })
    expect(secondLink).toHaveAttribute('href', '/user-1/tracks/pain/event-2')
  })

  it('uses custom title', () => {
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(<UpcomingEventsPanel title='Custom Title' upcomingEvents={events} />)

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('uses default empty state message when not provided', () => {
    render(<UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={[]} />)

    expect(
      screen.getByText('When you add upcoming appointments they will be listed here.')
    ).toBeInTheDocument()
  })
})
