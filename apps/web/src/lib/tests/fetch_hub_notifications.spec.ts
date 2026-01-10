import { cookies } from 'next/headers'
import { fetchHubNotifications } from '../fetch_hub_notifications'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { Notification } from '@/app/[userId]/types'

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

global.fetch = jest.fn()

describe('fetchHubNotifications', () => {
  const mockCookies = cookies as jest.Mock
  const mockFetch = global.fetch as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch notifications successfully', async () => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'reminder',
        message: 'Test notification',
        createdAt: new Date().toISOString()
      }
    ]

    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'abc123' }
      ])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockNotifications
      })
    })

    const result = await fetchHubNotifications('user-1')

    expect(result).toEqual(mockNotifications)
    expect(mockFetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1/hub/notifications`,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Cookie: 'session=abc123'
        })
      })
    )
  })

  it('should handle missing cookies', async () => {
    const mockNotifications: Notification[] = []

    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockNotifications
      })
    })

    const result = await fetchHubNotifications('user-1')

    expect(result).toEqual(mockNotifications)
    expect(mockFetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1/hub/notifications`,
      expect.objectContaining({
        cache: 'no-store',
        headers: {}
      })
    )
  })

  it('should return empty array on fetch error', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockRejectedValue(new Error('Network error'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const result = await fetchHubNotifications('user-1')

    expect(result).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should return empty array when response is not ok', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const result = await fetchHubNotifications('user-1')

    expect(result).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should return empty array when API response indicates failure', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Failed to fetch notifications'
      })
    })

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const result = await fetchHubNotifications('user-1')

    expect(result).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should return empty array when data is missing', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: null
      })
    })

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const result = await fetchHubNotifications('user-1')

    expect(result).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})

