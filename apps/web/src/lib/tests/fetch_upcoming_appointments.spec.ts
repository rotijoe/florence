import { fetchUpcomingAppointments } from '../fetch_upcoming_appointments'
import { SERVER_API_BASE_URL } from '@/constants/api'

// Mock fetch globally
global.fetch = jest.fn()

jest.mock('next/headers', () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      getAll: jest.fn(() => [
        { name: 'session', value: 'test-session-value' },
        { name: 'other-cookie', value: 'other-value' }
      ])
    })
  )
}))

describe('fetchUpcomingAppointments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches upcoming appointments successfully', async () => {
    const mockAppointments = [
      { eventId: 'e1', trackSlug: 'sleep', title: 'GP follow-up', date: '2025-10-21T00:00:00.000Z' }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { appointments: mockAppointments, hasMore: false }
      })
    })

    const result = await fetchUpcomingAppointments('user-1', 3)

    expect(result).toEqual({ appointments: mockAppointments, hasMore: false })
    expect(global.fetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1/appointments/upcoming?limit=3`,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Cookie: 'session=test-session-value; other-cookie=other-value'
        })
      })
    )
  })

  it('returns hasMore=true when there are more appointments', async () => {
    const mockAppointments = [
      { eventId: 'e1', trackSlug: 'sleep', title: 'GP follow-up', date: '2025-10-21T00:00:00.000Z' }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { appointments: mockAppointments, hasMore: true }
      })
    })

    const result = await fetchUpcomingAppointments('user-1', 3)

    expect(result).toEqual({ appointments: mockAppointments, hasMore: true })
  })

  it('returns empty appointments and hasMore=false when API responds with 401', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    })

    const result = await fetchUpcomingAppointments('user-1', 5)
    expect(result).toEqual({ appointments: [], hasMore: false })
  })

  it('throws error when API responds with non-401 error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error'
    })

    await expect(fetchUpcomingAppointments('user-1', 5)).rejects.toThrow(
      'Failed to fetch upcoming appointments: Server Error'
    )
  })

  it('throws error when API returns success=false without data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    })

    await expect(fetchUpcomingAppointments('user-1', 5)).rejects.toThrow('Failed to fetch upcoming appointments')
  })

  it('handles network connection errors', async () => {
    const networkError = new TypeError('fetch failed')
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

    await expect(fetchUpcomingAppointments('user-1', 5)).rejects.toThrow(
      `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
    )
  })
})



