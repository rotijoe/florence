import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubUpcomingAppointments } from '../index'
import type { AppointmentSummary } from '@/app/[userId]/types'
import { fetchAllAppointments } from '../helpers'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  fetchAllAppointments: jest.fn()
}))

const mockFetchAllAppointments = fetchAllAppointments as jest.MockedFunction<
  typeof fetchAllAppointments
>

describe('HubUpcomingAppointments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no appointments', () => {
    render(<HubUpcomingAppointments appointments={[]} userId='user-1' hasMore={false} />)

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

    render(<HubUpcomingAppointments appointments={appointments} userId='user-1' hasMore={false} />)

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

    render(<HubUpcomingAppointments appointments={appointments} userId='user-1' hasMore={false} />)

    const firstLink = screen.getByRole('link', { name: /First Appointment/i })
    expect(firstLink).toHaveAttribute('href', '/user-1/tracks/sleep/event-1')

    const secondLink = screen.getByRole('link', { name: /Second Appointment/i })
    expect(secondLink).toHaveAttribute('href', '/user-1/tracks/pain/event-2')
  })

  it('shows "Show more" button when hasMore is true', () => {
    const appointments: AppointmentSummary[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} userId='user-1' hasMore={true} />)

    expect(screen.getByRole('button', { name: /Show more/i })).toBeInTheDocument()
  })

  it('does not show "Show more" button when hasMore is false', () => {
    const appointments: AppointmentSummary[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    render(<HubUpcomingAppointments appointments={appointments} userId='user-1' hasMore={false} />)

    expect(screen.queryByRole('button', { name: /Show more/i })).not.toBeInTheDocument()
  })

  it('fetches and displays all appointments when "Show more" is clicked', async () => {
    const user = userEvent.setup()
    const initialAppointments: AppointmentSummary[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    const allAppointments: AppointmentSummary[] = [
      ...initialAppointments,
      {
        id: 'event-2',
        title: 'Second Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/pain/event-2'
      },
      {
        id: 'event-3',
        title: 'Third Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-3'
      }
    ]

    mockFetchAllAppointments.mockResolvedValue({
      appointments: allAppointments,
      hasMore: false
    })

    render(
      <HubUpcomingAppointments appointments={initialAppointments} userId='user-1' hasMore={true} />
    )

    const showMoreButton = screen.getByRole('button', { name: /Show more/i })
    await user.click(showMoreButton)

    expect(mockFetchAllAppointments).toHaveBeenCalledWith('user-1')

    await waitFor(() => {
      expect(screen.getByText('First Appointment')).toBeInTheDocument()
      expect(screen.getByText('Second Appointment')).toBeInTheDocument()
      expect(screen.getByText('Third Appointment')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Show more/i })).not.toBeInTheDocument()
  })

  it('shows loading state while fetching all appointments', async () => {
    const user = userEvent.setup()
    const appointments: AppointmentSummary[] = [
      {
        id: 'event-1',
        title: 'First Appointment',
        datetime: new Date(),
        href: '/user-1/tracks/sleep/event-1'
      }
    ]

    mockFetchAllAppointments.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ appointments: appointments, hasMore: false })
          }, 100)
        })
    )

    render(<HubUpcomingAppointments appointments={appointments} userId='user-1' hasMore={true} />)

    const showMoreButton = screen.getByRole('button', { name: /Show more/i })
    await user.click(showMoreButton)

    expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument()
    expect(showMoreButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Loading.../i })).not.toBeInTheDocument()
    })
  })
})
