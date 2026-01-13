import { createEventOnSaveAction } from '../actions'
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

describe('createEventOnSaveAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' }
      ])
    })
  })

  it('successfully creates event with all fields and redirects', async () => {
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
    formData.append('date', '2024-01-01T00:00:00.000Z')

    await createEventOnSaveAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug/events`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Cookie: 'session=session-value'
        }),
        body: JSON.stringify({
          title: 'Test Event',
          notes: 'Test notes',
          type: EventType.NOTE,
          date: '2024-01-01T00:00:00.000Z'
        })
      })
    )
    expect(redirect).toHaveBeenCalledWith('/user-1/tracks/track-slug/event-1')
  })

  it('successfully creates event with optional fields only', async () => {
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

    await createEventOnSaveAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Test Event',
          notes: null
        })
      })
    )
    expect(redirect).toHaveBeenCalled()
  })

  it('returns error when userId is missing', async () => {
    const formData = new FormData()
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Missing required fields: userId and trackSlug are required')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns error when trackSlug is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('title', 'Test Event')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Missing required fields: userId and trackSlug are required')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns error when title is empty', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', '')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Title is required and must be a non-empty string')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns error when title is only whitespace', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', '   ')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Title is required and must be a non-empty string')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles date conversion', async () => {
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
    formData.append('date', '2024-01-01')

    await createEventOnSaveAction(formData)

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    )
    expect(callBody.date).toBeDefined()
    expect(new Date(callBody.date).toISOString()).toBe(callBody.date)
  })

  it('handles type field when provided', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.RESULT,
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
    formData.append('type', EventType.RESULT)

    await createEventOnSaveAction(formData)

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    )
    expect(callBody.type).toBe(EventType.RESULT)
  })

  it('does not include type when not provided', async () => {
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

    await createEventOnSaveAction(formData)

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    )
    expect(callBody.type).toBeUndefined()
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

    await createEventOnSaveAction(formData)

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    )
    expect(callBody.notes).toBeNull()
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

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('API error message')
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

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Failed to create event: Internal Server Error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Failed to create event: Network error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Failed to create event: Unknown error occurred')
    expect(redirect).not.toHaveBeenCalled()
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

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Server error')
    expect(redirect).not.toHaveBeenCalled()
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

    const result = await createEventOnSaveAction(formData)

    expect(result.error).toBe('Failed to create event')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('rethrows NEXT_REDIRECT error', async () => {
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

    const redirectError = new Error('NEXT_REDIRECT')
    ;(redirect as jest.Mock).mockImplementationOnce(() => {
      throw redirectError
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Test Event')

    await expect(createEventOnSaveAction(formData)).rejects.toThrow('NEXT_REDIRECT')
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

    await createEventOnSaveAction(formData)

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    )
    expect(callBody.title).toBe('Test Event')
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

    await createEventOnSaveAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Cookie: expect.anything()
        })
      })
    )
    expect(redirect).toHaveBeenCalled()
  })
})
