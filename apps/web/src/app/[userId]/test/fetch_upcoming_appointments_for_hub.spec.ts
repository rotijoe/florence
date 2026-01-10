import { fetchUpcomingAppointmentsForHub } from '../helpers'
import { fetchUpcomingAppointments } from '@/lib/fetch_upcoming_appointments'

jest.mock('@/lib/fetch_upcoming_appointments', () => ({
  fetchUpcomingAppointments: jest.fn()
}))

describe('fetchUpcomingAppointmentsForHub', () => {
  const mockFetchUpcomingAppointments = fetchUpcomingAppointments as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and map upcoming appointments', async () => {
    const mockAppointments = [
      {
        eventId: 'event-1',
        title: 'Doctor Appointment',
        date: '2024-01-15T10:00:00Z',
        trackSlug: 'health-track'
      }
    ]

    mockFetchUpcomingAppointments.mockResolvedValue({
      appointments: mockAppointments
    })

    const result = await fetchUpcomingAppointmentsForHub('user-1')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'event-1',
      title: 'Doctor Appointment',
      datetime: '2024-01-15T10:00:00Z',
      href: '/user-1/tracks/health-track/event-1'
    })
    expect(mockFetchUpcomingAppointments).toHaveBeenCalledWith('user-1', 3)
  })

  it('should return empty array on error', async () => {
    mockFetchUpcomingAppointments.mockRejectedValue(new Error('Network error'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const result = await fetchUpcomingAppointmentsForHub('user-1')

    expect(result).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should handle empty appointments array', async () => {
    mockFetchUpcomingAppointments.mockResolvedValue({
      appointments: []
    })

    const result = await fetchUpcomingAppointmentsForHub('user-1')

    expect(result).toEqual([])
  })
})

