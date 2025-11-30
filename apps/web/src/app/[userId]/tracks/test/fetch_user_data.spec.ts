import { fetchUserData } from '../helpers'
import type { UserWithTracks, ApiResponse } from '../types'

// Mock the global fetch
global.fetch = jest.fn()

describe('fetchUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully fetch user data with health tracks', async () => {
    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: [
        {
          id: 'track-1',
          title: 'Diabetes Management',
          slug: 'diabetes-management',
          description: 'Tracking blood sugar',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userId: 'user-123'
        }
      ]
    }

    const mockResponse: ApiResponse<UserWithTracks> = {
      success: true,
      data: mockUserData
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await fetchUserData()

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8787/api/user/me', {
      credentials: 'include'
    })
    expect(result).toEqual(mockUserData)
  })

  it('should handle 401 unauthorized error', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false,
      error: 'Unauthorized'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => mockErrorResponse
    })

    await expect(fetchUserData()).rejects.toThrow('Unauthorized')
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchUserData()).rejects.toThrow('Network error')
  })

  it('should handle API errors with custom error messages', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false,
      error: 'User not found'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => mockErrorResponse
    })

    await expect(fetchUserData()).rejects.toThrow('User not found')
  })

  it('should handle response.ok true but data.success false', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false,
      error: 'Server error'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockErrorResponse
    })

    await expect(fetchUserData()).rejects.toThrow('Server error')
  })

  it('should use default error message when data.success is false and no error message', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockErrorResponse
    })

    await expect(fetchUserData()).rejects.toThrow('Failed to fetch user data')
  })

  it('should throw error when response is ok but data.data is missing', async () => {
    const mockResponse: ApiResponse<UserWithTracks> = {
      success: true,
      data: undefined
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await expect(fetchUserData()).rejects.toThrow('No user data received')
  })

  it('should throw error when response is ok but data.data is null', async () => {
    const mockResponse: ApiResponse<UserWithTracks> = {
      success: true,
      data: null as unknown as UserWithTracks
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await expect(fetchUserData()).rejects.toThrow('No user data received')
  })

  it('should use custom API URL from environment variable', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.example.com'

    const mockUserData: UserWithTracks = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      tracks: []
    }

    const mockResponse: ApiResponse<UserWithTracks> = {
      success: true,
      data: mockUserData
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await fetchUserData()

    expect(global.fetch).toHaveBeenCalledWith('https://custom-api.example.com/api/user/me', {
      credentials: 'include'
    })

    // Restore original env
    if (originalEnv) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_API_URL
    }
  })
})
