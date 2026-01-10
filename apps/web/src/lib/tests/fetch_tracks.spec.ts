import { cookies } from 'next/headers'
import { fetchTracksWithCookies } from '../fetch_tracks'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { TrackResponse } from '@packages/types'

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

global.fetch = jest.fn()

describe('fetchTracksWithCookies', () => {
  const mockCookies = cookies as jest.Mock
  const mockFetch = global.fetch as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch tracks successfully', async () => {
    const mockTracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: 'Test description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        data: mockTracks
      })
    })

    const result = await fetchTracksWithCookies('user-1')

    expect(result).toEqual(mockTracks)
    expect(mockFetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1/tracks`,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Cookie: 'session=abc123'
        })
      })
    )
  })

  it('should handle missing cookies', async () => {
    const mockTracks: TrackResponse[] = []

    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockTracks
      })
    })

    const result = await fetchTracksWithCookies('user-1')

    expect(result).toEqual(mockTracks)
    expect(mockFetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1/tracks`,
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

    await expect(fetchTracksWithCookies('user-1')).rejects.toThrow('Failed to fetch tracks: Not Found')
  })

  it('should throw error when API response indicates failure', async () => {
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Failed to fetch tracks'
      })
    })

    await expect(fetchTracksWithCookies('user-1')).rejects.toThrow('Failed to fetch tracks')
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

    await expect(fetchTracksWithCookies('user-1')).rejects.toThrow('Failed to fetch tracks')
  })
})

