import { fetchTrack, fetchTrackEvents } from '../helpers'
import { SERVER_API_BASE_URL } from '@/constants/api'

// Mock fetch globally
global.fetch = jest.fn()

describe('fetchTrack helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchTrack', () => {
    it('handles network connection errors', async () => {
      const networkError = new TypeError('fetch failed')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

      await expect(fetchTrack('test-slug')).rejects.toThrow(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    })

    it('re-throws non-network errors', async () => {
      const customError = new Error('Custom error')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(customError)

      await expect(fetchTrack('test-slug')).rejects.toThrow('Custom error')
    })

    it('handles API error without error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false })
      })

      await expect(fetchTrack('test-slug')).rejects.toThrow('Failed to fetch track')
    })
  })

  describe('fetchTrackEvents', () => {
    it('handles network connection errors', async () => {
      const networkError = new TypeError('fetch failed')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

      await expect(fetchTrackEvents('test-slug')).rejects.toThrow(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    })

    it('re-throws non-network errors', async () => {
      const customError = new Error('Custom error')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(customError)

      await expect(fetchTrackEvents('test-slug')).rejects.toThrow('Custom error')
    })

    it('handles API error without error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false })
      })

      await expect(fetchTrackEvents('test-slug')).rejects.toThrow('Failed to fetch events')
    })
  })
})

