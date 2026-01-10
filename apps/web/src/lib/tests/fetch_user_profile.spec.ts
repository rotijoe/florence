import { cookies } from 'next/headers'
import { fetchUserProfileWithCookies } from '../fetch_user_profile'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { UserProfileResponse } from '@packages/types'

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

global.fetch = jest.fn()

describe('fetchUserProfileWithCookies', () => {
  const mockCookies = cookies as jest.Mock
  const mockFetch = global.fetch as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch user profile successfully', async () => {
    const mockProfile: UserProfileResponse = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    }

    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'abc123' }
      ])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProfile
      })
    })

    const result = await fetchUserProfileWithCookies('user-1')

    expect(result).toEqual(mockProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1`,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Cookie: 'session=abc123'
        })
      })
    )
  })

  it('should handle missing cookies', async () => {
    const mockProfile: UserProfileResponse = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    }

    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProfile
      })
    })

    const result = await fetchUserProfileWithCookies('user-1')

    expect(result).toEqual(mockProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1`,
      expect.objectContaining({
        cache: 'no-store',
        headers: {}
      })
    )
  })

  it('should throw error when response is not ok', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    await expect(fetchUserProfileWithCookies('user-1')).rejects.toThrow('Failed to fetch user profile: Not Found')
  })

  it('should throw error when API response indicates failure', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Failed to fetch user profile'
      })
    })

    await expect(fetchUserProfileWithCookies('user-1')).rejects.toThrow('Failed to fetch user profile')
  })

  it('should throw error when data is missing', async () => {
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

    await expect(fetchUserProfileWithCookies('user-1')).rejects.toThrow('Failed to fetch user profile')
  })
})

