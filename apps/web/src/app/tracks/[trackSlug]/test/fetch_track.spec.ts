import { fetchTrack } from '../helpers'

describe('fetchTrack', () => {
  const originalFetch = global.fetch

  afterEach(() => {
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

    const track = await fetchTrack('sleep')

    expect(track).toEqual(mockTrack)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tracks/sleep'),
      expect.objectContaining({ cache: 'no-store' })
    )
  })

  it('throws error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    await expect(fetchTrack('nonexistent')).rejects.toThrow(
      'Failed to fetch track'
    )
  })

  it('throws error when API returns error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Track not found' })
    })

    await expect(fetchTrack('nonexistent')).rejects.toThrow('Track not found')
  })
})
