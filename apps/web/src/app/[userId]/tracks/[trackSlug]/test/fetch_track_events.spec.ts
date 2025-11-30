import { fetchTrackEvents } from '../helpers'
import { EventType } from '@packages/types'

describe('fetchTrackEvents', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fetches events successfully', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        trackId: 'track-1',
        date: '2025-10-21T00:00:00.000Z',
        title: 'Event 1',
        notes: 'Test description',
        type: EventType.NOTE,
        fileUrl: null,
        createdAt: '2025-10-21T00:00:00.000Z',
        updatedAt: '2025-10-21T00:00:00.000Z'
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockEvents })
    })

    const events = await fetchTrackEvents('user-1', 'sleep')

    expect(events).toEqual(mockEvents)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/user-1/tracks/sleep/events?sort=desc&limit=100'),
      expect.objectContaining({ cache: 'no-store' })
    )
  })

  it('throws error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    await expect(fetchTrackEvents('user-1', 'nonexistent')).rejects.toThrow(
      'Failed to fetch events'
    )
  })

  it('throws error when API returns error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Track not found' })
    })

    await expect(fetchTrackEvents('user-1', 'nonexistent')).rejects.toThrow('Track not found')
  })
})
