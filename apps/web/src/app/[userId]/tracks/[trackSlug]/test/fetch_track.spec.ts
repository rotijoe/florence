import { fetchTrack } from '../helpers'

// Mock next/headers cookies
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

describe('fetchTrack', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    jest.clearAllMocks()
    global.fetch = originalFetch
  })

  it('fetches track data successfully', async () => {
    const mockTrack = {
      id: 'track-1',
      name: 'Sleep',
      slug: 'sleep',
      createdAt: '2025-10-21T00:00:00.000Z'
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockTrack })
    })

    const track = await fetchTrack('user-1', 'sleep')

    expect(track).toEqual(mockTrack)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/user-1/tracks/sleep'),
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Cookie: 'session=test-session-value; other-cookie=other-value'
        })
      })
    )
  })

  it('throws error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    await expect(fetchTrack('user-1', 'nonexistent')).rejects.toThrow('Failed to fetch track')
  })

  it('throws error when API returns error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Track not found' })
    })

    await expect(fetchTrack('user-1', 'nonexistent')).rejects.toThrow('Track not found')
  })
})
