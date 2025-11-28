import { ApiResponse, EventResponse, EventType } from '@packages/types'
import { redirect } from 'next/navigation'
import { createEventAction } from '../actions'
import { API_BASE_URL } from '@/constants/api'
import { cookies } from 'next/headers'

describe('createEventAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockCookies = cookies as jest.Mock
    const redirectMock = redirect as unknown as jest.Mock
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' },
        { name: 'token', value: 'token-value' }
      ])
    })
  })

  it('creates event successfully and redirects', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Untitled event',
      notes: null,
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

    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')

    try {
      await createEventAction(formData)
    } catch (error: unknown) {
      // redirect throws an error in Next.js
      if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        throw error
      }
    }

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/tracks/track-slug/events`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Cookie: 'session=session-value; token=token-value'
        }),
        body: JSON.stringify({})
      })
    )
    expect(redirect).toHaveBeenCalledWith('/tracks/track-slug/event-1?new=1')
  })

  it('returns error when trackSlug is missing', async () => {
    const formData = new FormData()

    const result = await createEventAction(formData)

    expect(result.error).toBe('Missing required fields: trackSlug is required')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false, error: 'Invalid data' })
    })

    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Invalid data')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Failed to create event: Network error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API response without data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Failed to create event')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles empty cookies', async () => {
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Untitled event',
      notes: null,
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

    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')

    try {
      await createEventAction(formData)
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        throw error
      }
    }

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Cookie: expect.anything()
        })
      })
    )
  })
})
