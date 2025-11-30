import { createUserTrack } from '../helpers'
import type { HealthTrack, ApiResponse } from '../types'

// Mock the global fetch
global.fetch = jest.fn()

describe('createUserTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully create a track with title and description', async () => {
    const mockTrack: HealthTrack = {
      id: 'track-new',
      title: 'New Track',
      slug: 'new-track',
      description: 'Test description',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user-123'
    }

    const mockResponse: ApiResponse<HealthTrack> = {
      success: true,
      data: mockTrack
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponse
    })

    const result = await createUserTrack('New Track', 'Test description')

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8787/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        title: 'New Track',
        description: 'Test description'
      })
    })
    expect(result).toEqual(mockTrack)
  })

  it('should successfully create a track with only title', async () => {
    const mockTrack: HealthTrack = {
      id: 'track-new',
      title: 'New Track',
      slug: 'new-track',
      description: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user-123'
    }

    const mockResponse: ApiResponse<HealthTrack> = {
      success: true,
      data: mockTrack
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponse
    })

    const result = await createUserTrack('New Track')

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8787/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        title: 'New Track'
      })
    })
    expect(result).toEqual(mockTrack)
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

    await expect(createUserTrack('New Track')).rejects.toThrow('Unauthorized')
  })

  it('should handle 400 validation error', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false,
      error: 'Title is required and must be a non-empty string'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse
    })

    await expect(createUserTrack('')).rejects.toThrow(
      'Title is required and must be a non-empty string'
    )
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(createUserTrack('New Track')).rejects.toThrow('Network error')
  })

  it('should handle API errors with custom error messages', async () => {
    const mockErrorResponse: ApiResponse<never> = {
      success: false,
      error: 'Database connection failed'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => mockErrorResponse
    })

    await expect(createUserTrack('New Track')).rejects.toThrow('Database connection failed')
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

    await expect(createUserTrack('New Track')).rejects.toThrow('Server error')
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

    await expect(createUserTrack('New Track')).rejects.toThrow('Failed to create track')
  })

  it('should throw error when response is ok but data.data is missing', async () => {
    const mockResponse: ApiResponse<HealthTrack> = {
      success: true,
      data: undefined
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponse
    })

    await expect(createUserTrack('New Track')).rejects.toThrow('No track data received')
  })

  it('should use custom API URL from environment variable', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.example.com'

    const mockTrack: HealthTrack = {
      id: 'track-new',
      title: 'New Track',
      slug: 'new-track',
      description: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user-123'
    }

    const mockResponse: ApiResponse<HealthTrack> = {
      success: true,
      data: mockTrack
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponse
    })

    await createUserTrack('New Track')

    expect(global.fetch).toHaveBeenCalledWith('https://custom-api.example.com/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        title: 'New Track'
      })
    })

    // Restore original env
    if (originalEnv) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_API_URL
    }
  })
})
