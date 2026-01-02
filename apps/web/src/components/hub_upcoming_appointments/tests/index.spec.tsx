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

  it('renders appointments with date box, time and title', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 30, 0, 0)
    const appointments: AppointmentSummary[] = [
      {
        id: '1',
        title: 'GP Appointment',
        datetime: tomorrow,
        location: 'Clinic A',
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} />)

    // Date box shows TOM
    expect(screen.getByText('TOM')).toBeInTheDocument()
    // Time shows above title
    expect(screen.getByText('14:30')).toBeInTheDocument()
    // Title
    expect(screen.getByText('GP Appointment')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /GP Appointment/i })
    expect(link).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')
  })

  it('renders each appointment as a link to the event detail page', () => {
    const date1 = new Date()
    date1.setDate(date1.getDate() + 3) // 3 days from now
    const date2 = new Date()
    date2.setDate(date2.getDate() + 4) // 4 days from now
    const appointments: AppointmentSummary[] = [
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

    render(<HubUpcomingAppointments appointments={appointments} />)

    const firstLink = screen.getByRole('link', { name: /First Appointment/i })
    expect(firstLink).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')

    const secondLink = screen.getByRole('link', { name: /Second Appointment/i })
    expect(secondLink).toHaveAttribute('href', '/user-1/tracks/pain/event-2')
  })
})
