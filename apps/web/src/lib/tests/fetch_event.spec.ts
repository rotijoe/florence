import { fetchEvent } from '../fetch_event'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { EventResponse, ApiResponse } from '@packages/types'
import { EventType } from '@packages/types'

// Mock fetch globally
global.fetch = jest.fn()

describe('fetchEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch event successfully', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.RESULT,
      title: 'Test Event',
      notes: 'Test Description',
      fileUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    const mockResponse: ApiResponse<EventResponse> = {
      success: true,
      data: mockEvent
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await fetchEvent('event-1', 'user-1', 'track-slug')

    expect(global.fetch).toHaveBeenCalledWith(
      `${SERVER_API_BASE_URL}/api/users/user-1/tracks/track-slug/events/event-1`,
      { cache: 'no-store' }
    )
    expect(result).toEqual(mockEvent)
  })

  it('should throw error when response is not ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    })

    await expect(fetchEvent('event-1', 'user-1', 'track-slug')).rejects.toThrow(
      'Failed to fetch event: Not Found'
    )
  })

  it('should throw error when API response indicates failure', async () => {
    const mockResponse: ApiResponse<EventResponse> = {
      success: false,
      data: undefined,
      error: 'Event not found'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await expect(fetchEvent('event-1', 'user-1', 'track-slug')).rejects.toThrow('Event not found')
  })

  it('should throw generic error when API response fails without error message', async () => {
    const mockResponse: ApiResponse<EventResponse> = {
      success: false,
      data: undefined
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await expect(fetchEvent('event-1', 'user-1', 'track-slug')).rejects.toThrow('Failed to fetch event')
  })
})

