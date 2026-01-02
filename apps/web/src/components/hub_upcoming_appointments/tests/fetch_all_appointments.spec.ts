import { fetchAllAppointments } from '../helpers'
import { API_BASE_URL } from '@/constants/api'

// Mock fetch globally
global.fetch = jest.fn()

describe('fetchAllAppointments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches all appointments successfully', async () => {
    const mockAppointments = [
      { eventId: 'e1', trackSlug: 'sleep', title: 'GP follow-up', date: '2025-10-21T00:00:00.000Z' },
      { eventId: 'e2', trackSlug: 'pain', title: 'Physio', date: '2025-10-22T00:00:00.000Z' }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { appointments: mockAppointments, hasMore: false }
      })
    })

    const result = await fetchAllAppointments('user-1')

    expect(result).toEqual({
      appointments: [
        {
          id: 'e1',
          title: 'GP follow-up',
          datetime: '2025-10-21T00:00:00.000Z',
          location: null,
          href: '/user-1/tracks/sleep/e1'
        },
        {
          id: 'e2',
          title: 'Physio',
          datetime: '2025-10-22T00:00:00.000Z',
          location: null,
          href: '/user-1/tracks/pain/e2'
        }
      ],
      hasMore: false
    })

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/appointments/upcoming?limit=50`,
      expect.objectContaining({
        cache: 'no-store',
        credentials: 'include'
      })
    )
  })

  it('returns empty appointments and hasMore=false when API responds with 401', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    })

    const result = await fetchAllAppointments('user-1')
    expect(result).toEqual({ appointments: [], hasMore: false })
  })

  it('throws error when API responds with non-401 error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error'
    })

    await expect(fetchAllAppointments('user-1')).rejects.toThrow(
      'Failed to fetch upcoming appointments: Server Error'
    )
  })

  it('throws error when API returns success=false without data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    })

    await expect(fetchAllAppointments('user-1')).rejects.toThrow('Failed to fetch upcoming appointments')
  })

  it('handles network connection errors', async () => {
    const networkError = new TypeError('fetch failed')
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

    await expect(fetchAllAppointments('user-1')).rejects.toThrow(
      `Failed to connect to API server at ${API_BASE_URL}. Make sure the API server is running.`
    )
  })
})

