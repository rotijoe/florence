import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('shows "Show more" button when hasMore is true and onShowMore is provided', () => {
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    const mockOnShowMore = jest.fn()

    render(
      <UpcomingEventsPanel
        title='Upcoming appointments'
        upcomingEvents={events}
        hasMore={true}
        onShowMore={mockOnShowMore}
      />
    )

    expect(screen.getByRole('button', { name: /Show more/i })).toBeInTheDocument()
  })

  it('does not show "Show more" button when hasMore is false', () => {
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(
      <UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={events} hasMore={false} />
    )

    expect(screen.queryByRole('button', { name: /Show more/i })).not.toBeInTheDocument()
  })

  it('does not show "Show more" button when onShowMore is not provided', () => {
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(
      <UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={events} hasMore={true} />
    )

    expect(screen.queryByRole('button', { name: /Show more/i })).not.toBeInTheDocument()
  })

  it('calls onShowMore when "Show more" is clicked', async () => {
    const user = userEvent.setup()
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    const mockOnShowMore = jest.fn().mockResolvedValue(undefined)

    render(
      <UpcomingEventsPanel
        title='Upcoming appointments'
        upcomingEvents={events}
        hasMore={true}
        onShowMore={mockOnShowMore}
      />
    )

    const showMoreButton = screen.getByRole('button', { name: /Show more/i })
    await user.click(showMoreButton)

    expect(mockOnShowMore).toHaveBeenCalledTimes(1)
  })

  it('shows loading state while fetching all events', async () => {
    const user = userEvent.setup()
    const events: UpcomingEvent[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    const mockOnShowMore = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 100)
        })
    )

    render(
      <UpcomingEventsPanel
        title='Upcoming appointments'
        upcomingEvents={events}
        hasMore={true}
        onShowMore={mockOnShowMore}
      />
    )

    const showMoreButton = screen.getByRole('button', { name: /Show more/i })
    await user.click(showMoreButton)

    expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument()
    expect(showMoreButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Loading.../i })).not.toBeInTheDocument()
    })
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
