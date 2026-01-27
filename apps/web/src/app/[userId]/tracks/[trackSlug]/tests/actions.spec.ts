import { createEventAction, deleteTrackAction } from '../actions'
import { API_BASE_URL } from '@/constants/api'
import { EventType, type EventResponse, type ApiResponse } from '@packages/types'

// Mock Next.js APIs
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Mock fetch globally
global.fetch = jest.fn()

describe('createEventAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' },
        { name: 'auth', value: 'auth-value' }
      ])
    })
  })

  it('successfully creates event with all fields', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Test Event',
      notes: 'Test notes',
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
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')
    formData.append('notes', 'Test notes')
    formData.append('type', EventType.NOTE)

    const result = await createEventAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug/events`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Cookie: 'session=session-value; auth=auth-value'
        }),
        body: JSON.stringify({
          title: 'Test Event',
          notes: 'Test notes',
          type: EventType.NOTE
        })
      })
    )
    expect(result.event).toEqual(mockEvent)
    expect(result.error).toBeUndefined()
  })

  it('returns error when userId is missing', async () => {
    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Missing required fields: userId and trackSlug are required')
    expect(result.event).toBeUndefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns error when trackSlug is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Missing required fields: userId and trackSlug are required')
    expect(result.event).toBeUndefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns error when title is empty', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', '')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Title is required and must be a non-empty string')
    expect(result.event).toBeUndefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns error when title is only whitespace', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', '   ')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Title is required and must be a non-empty string')
    expect(result.event).toBeUndefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles empty notes by converting to null', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Test Event',
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
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')
    formData.append('notes', '')

    const result = await createEventAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Test Event',
          notes: null,
          type: EventType.NOTE
        })
      })
    )
    expect(result.event).toEqual(mockEvent)
  })

  it('uses default type when type is not provided', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Test Event',
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
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Test Event',
          notes: null,
          type: EventType.NOTE
        })
      })
    )
    expect(result.event).toEqual(mockEvent)
  })

  it('handles API error response', async () => {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'API error message'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => errorResponse
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('API error message')
    expect(result.event).toBeUndefined()
  })

  it('handles API error when json parsing fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Failed to create event: Internal Server Error')
    expect(result.event).toBeUndefined()
  })

  it('handles network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Failed to create event: Network error')
    expect(result.event).toBeUndefined()
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Failed to create event: Unknown error occurred')
    expect(result.event).toBeUndefined()
  })

  it('handles response with success=false', async () => {
    const mockResponse: ApiResponse<EventResponse> = {
      success: false,
      error: 'Server error'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Server error')
    expect(result.event).toBeUndefined()
  })

  it('handles response with missing data', async () => {
    const mockResponse: ApiResponse<EventResponse> = {
      success: true,
      data: undefined as unknown as EventResponse
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventAction(formData)

    expect(result.error).toBe('Failed to create event')
    expect(result.event).toBeUndefined()
  })

  it('trims title whitespace', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Test Event',
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
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', '  Test Event  ')

    await createEventAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Test Event',
          notes: null,
          type: EventType.NOTE
        })
      })
    )
  })

  it('handles empty cookie header', async () => {
    ;(cookies as jest.Mock).mockResolvedValueOnce({
      getAll: jest.fn().mockReturnValue([])
    })

    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Test Event',
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
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    await createEventAction(formData)

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

describe('deleteTrackAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([{ name: 'session', value: 'session-value' }])
    })
  })

  it('successfully deletes track and redirects', async () => {
    const mockResponse: ApiResponse<never> = {
      success: true
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await deleteTrackAction('user-1', 'track-slug')

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Cookie: 'session=session-value'
        })
      })
    )
    expect(redirect).toHaveBeenCalledWith('/user-1/tracks')
  })

  it('returns error when userId is missing', async () => {
    const result = await deleteTrackAction('', 'track-slug')

    expect(result.error).toBe('Missing required fields: userId and trackSlug are required')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns error when trackSlug is missing', async () => {
    const result = await deleteTrackAction('user-1', '')

    expect(result.error).toBe('Missing required fields: userId and trackSlug are required')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API error response', async () => {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Track not found'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
      json: async () => errorResponse
    })

    const result = await deleteTrackAction('user-1', 'track-slug')

    expect(result.error).toBe('Track not found')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API error when json parsing fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const result = await deleteTrackAction('user-1', 'track-slug')

    expect(result.error).toBe('Failed to delete track: Internal Server Error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await deleteTrackAction('user-1', 'track-slug')

    expect(result.error).toBe('Failed to delete track: Network error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const result = await deleteTrackAction('user-1', 'track-slug')

    expect(result.error).toBe('Failed to delete track: Unknown error occurred')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles response with success=false', async () => {
    const mockResponse: ApiResponse<never> = {
      success: false,
      error: 'Server error'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await deleteTrackAction('user-1', 'track-slug')

    expect(result.error).toBe('Server error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles empty cookie header', async () => {
    ;(cookies as jest.Mock).mockResolvedValueOnce({
      getAll: jest.fn().mockReturnValue([])
    })

    const mockResponse: ApiResponse<never> = {
      success: true
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    await deleteTrackAction('user-1', 'track-slug')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Cookie: expect.anything()
        })
      })
    )
    expect(redirect).toHaveBeenCalledWith('/user-1/tracks')
  })
})
