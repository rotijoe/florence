import { fetchTracks } from '../helpers'
import type { TrackResponse, ApiResponse } from '@packages/types'

// Mock the global fetch
global.fetch = jest.fn()

describe('fetchTracks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully fetch tracks', async () => {
    const mockTracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-123',
        title: 'Diabetes Management',
        slug: 'diabetes-management',
        description: 'Tracking blood sugar',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    const mockResponse: ApiResponse<TrackResponse[]> = {
      success: true,
      data: mockTracks
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await fetchTracks('user-123')

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8787/api/users/user-123/tracks', {
      credentials: 'include'
    })
    expect(result).toEqual(mockTracks)
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

    await expect(fetchTracks('user-123')).rejects.toThrow('Unauthorized')
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchTracks('user-123')).rejects.toThrow('Network error')
  })

  it('should handle API errors with custom error messages', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false,
      error: 'Tracks not found'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => mockErrorResponse
    })

    await expect(fetchTracks('user-123')).rejects.toThrow('Tracks not found')
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

    await expect(fetchTracks('user-123')).rejects.toThrow('Server error')
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

    await expect(fetchTracks('user-123')).rejects.toThrow('Failed to fetch tracks')
  })

  it('should throw error when response is ok but data.data is missing', async () => {
    const mockResponse: ApiResponse<TrackResponse[]> = {
      success: true,
      data: undefined
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await expect(fetchTracks('user-123')).rejects.toThrow('No tracks data received')
  })

  it('should throw error when response is ok but data.data is null', async () => {
    const mockResponse: ApiResponse<TrackResponse[]> = {
      success: true,
      data: null as unknown as TrackResponse[]
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await expect(fetchTracks('user-123')).rejects.toThrow('No tracks data received')
  })

  it('should use custom API URL from environment variable', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.example.com'

    const mockTracks: TrackResponse[] = []

    const mockResponse: ApiResponse<TrackResponse[]> = {
      success: true,
      data: mockTracks
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await fetchTracks('user-123')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://custom-api.example.com/api/users/user-123/tracks',
      {
        credentials: 'include'
      }
    )

    // Restore original env
    if (originalEnv) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_API_URL
    }
  })
})

