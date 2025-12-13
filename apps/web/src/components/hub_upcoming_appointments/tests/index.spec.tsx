import { render, screen } from '@testing-library/react'
import { HubUpcomingAppointments } from '../index'
import type { AppointmentSummary } from '@/app/[userId]/types'

describe('HubUpcomingAppointments', () => {
  it('renders empty state when no appointments', () => {
    render(<HubUpcomingAppointments appointments={[]} />)

    expect(screen.getByText('Upcoming appointments')).toBeInTheDocument()
    expect(
      screen.getByText('When you add upcoming appointments they will be listed here.')
    ).toBeInTheDocument()
  })

  it('renders appointments when present', () => {
    const appointments: AppointmentSummary[] = [
      {
        id: '1',
        title: 'GP Appointment',
        datetimeLabel: 'Tomorrow at 2:00 PM',
        location: 'Clinic A',
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} />)

    expect(screen.getByText('GP Appointment')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow at 2:00 PM · Clinic A')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /GP Appointment/i })
    expect(link).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')
  })

  it('renders appointment without location suffix when location is missing', () => {
    const appointments: AppointmentSummary[] = [
      {
        id: '1',
        title: 'GP Appointment',
        datetimeLabel: 'Tomorrow at 2:00 PM',
        location: undefined,
        href: '/user-1/tracks/pain/event-2'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} />)

    expect(screen.getByText('GP Appointment')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow at 2:00 PM')).toBeInTheDocument()
    expect(screen.queryByText(/ · /)).not.toBeInTheDocument()

    const link = screen.getByRole('link', { name: /GP Appointment/i })
    expect(link).toHaveAttribute('href', '/user-1/tracks/pain/event-2')
  })

  it('renders each appointment as a link to the event detail page', () => {
    const appointments: AppointmentSummary[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetimeLabel: 'Mon, 1 Jan · 10:00',
        href: '/user-1/tracks/sleep/event-1'
      },
      {
        id: 'event-2',
        title: 'Second Appointment',
        datetimeLabel: 'Tue, 2 Jan · 14:00',
        href: '/user-1/tracks/pain/event-2'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} />)

    const firstLink = screen.getByRole('link', { name: /First Appointment/i })
    expect(firstLink).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')

    const secondLink = screen.getByRole('link', { name: /Second Appointment/i })
    expect(secondLink).toHaveAttribute('href', '/user-1/tracks/pain/event-2')
  })
})
