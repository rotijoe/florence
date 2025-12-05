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
        location: 'Clinic A'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} />)

    expect(screen.getByText('GP Appointment')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow at 2:00 PM · Clinic A')).toBeInTheDocument()
  })
})
