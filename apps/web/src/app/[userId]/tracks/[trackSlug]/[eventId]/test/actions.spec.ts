import {
  updateEventAction,
  createEventUploadIntentAction,
  confirmEventUploadAction,
  deleteEventAction
} from '../actions'
import { API_BASE_URL } from '@/constants/api'
import { EventType, type EventResponse, type ApiResponse } from '@packages/types'

// Mock Next.js APIs
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Mock fetch globally
global.fetch = jest.fn()

describe('updateEventAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })
  })

  it('updates event successfully', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.RESULT,
      title: 'Updated Title',
      notes: 'Updated Description',
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
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Updated Title')
    formData.append('notes', 'Updated Description')

    const result = await updateEventAction(null, formData)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug/events/event-1`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated Title',
          notes: 'Updated Description'
        })
      })
    )
    expect(result.event).toEqual(mockEvent)
    expect(result.error).toBeUndefined()
    expect(revalidatePath).toHaveBeenCalledWith('/user-1/tracks/track-slug/event-1')
    expect(revalidatePath).toHaveBeenCalledWith('/user-1/tracks/track-slug')
  })

  it('returns error when eventId is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
    expect(result.event).toBeUndefined()
  })

  it('returns error when trackSlug is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
  })

  it('returns error when title is empty', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', '   ')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Title is required and must be a non-empty string')
  })

  it('handles null notes', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.RESULT,
      title: 'Title',
      notes: null,
      fileUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockEvent })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')
    formData.append('notes', '')

    const result = await updateEventAction(null, formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Title',
          notes: null
        })
      })
    )
    expect(result.event).toEqual(mockEvent)
  })

  it('handles API error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false, error: 'Invalid data' })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Invalid data')
  })

  it('handles API error response without error message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Failed to update event: Bad Request')
  })

  it('handles JSON parse error in error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toContain('Failed to update event')
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Failed to update event: Network error')
  })

  it('handles API response without data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Failed to update event')
  })

  it('returns error when title is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    // title is not appended, so formData.get('title') returns null

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Title is required and must be a non-empty string')
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('title', 'Title')

    const result = await updateEventAction(null, formData)

    expect(result.error).toBe('Failed to update event: Unknown error occurred')
  })
})

describe('createEventUploadIntentAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' },
        { name: 'token', value: 'token-value' }
      ])
    })
  })

  it('creates upload intent successfully', async () => {
    const mockResponse: ApiResponse<{
      uploadUrl: string
      fileUrl: string
      key: string
      expiresAt: string
      maxSize: number
      allowedContentTypes: string[]
    }> = {
      success: true,
      data: {
        uploadUrl: 'https://s3.amazonaws.com/upload-url',
        fileUrl: 'https://s3.amazonaws.com/file-url',
        key: 'events/event-1/file.pdf',
        expiresAt: '2024-01-01T00:15:00.000Z',
        maxSize: 10485760,
        allowedContentTypes: ['application/pdf']
      }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug/events/event-1/upload-url`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Cookie: 'session=session-value; token=token-value'
        }),
        body: JSON.stringify({
          fileName: 'file.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      })
    )
    expect(result.uploadUrl).toBe('https://s3.amazonaws.com/upload-url')
    expect(result.fileUrl).toBe('https://s3.amazonaws.com/file-url')
    expect(result.key).toBe('events/event-1/file.pdf')
    expect(result.error).toBeUndefined()
  })

  it('returns error when eventId is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
  })

  it('returns error when fileName is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe(
      'Missing required fields: fileName, contentType, and size are required'
    )
  })

  it('handles API error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false, error: 'Invalid file type' })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Invalid file type')
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Failed to create upload intent: Network error')
  })

  it('handles empty cookies', async () => {
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })

    const mockResponse: ApiResponse<{
      uploadUrl: string
      fileUrl: string
      key: string
      expiresAt: string
      maxSize: number
      allowedContentTypes: string[]
    }> = {
      success: true,
      data: {
        uploadUrl: 'https://s3.amazonaws.com/upload-url',
        fileUrl: 'https://s3.amazonaws.com/file-url',
        key: 'events/event-1/file.pdf',
        expiresAt: '2024-01-01T00:15:00.000Z',
        maxSize: 10485760,
        allowedContentTypes: ['application/pdf']
      }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Cookie: expect.anything()
        })
      })
    )
    expect(result.uploadUrl).toBeDefined()
  })

  it('returns error when trackSlug is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
  })

  it('returns error when contentType is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe(
      'Missing required fields: fileName, contentType, and size are required'
    )
  })

  it('returns error when size is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe(
      'Missing required fields: fileName, contentType, and size are required'
    )
  })

  it('handles API error response without error message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Failed to create upload intent: Bad Request')
  })

  it('handles JSON parse error in error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toContain('Failed to create upload intent')
  })

  it('handles API response without data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Failed to create upload intent')
  })

  it('handles API response with success false but no error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Failed to create upload intent')
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileName', 'file.pdf')
    formData.append('contentType', 'application/pdf')
    formData.append('size', '1024')

    const result = await createEventUploadIntentAction(formData)

    expect(result.error).toBe('Failed to create upload intent: Unknown error occurred')
  })
})

describe('confirmEventUploadAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([{ name: 'session', value: 'session-value' }])
    })
  })

  it('confirms upload successfully', async () => {
    const mockEvent: EventResponse = {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.RESULT,
      title: 'Event',
      notes: 'Description',
      fileUrl: 'https://s3.amazonaws.com/file-url',
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
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug/events/event-1/upload-confirm`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          fileUrl: 'https://s3.amazonaws.com/file-url',
          key: 'events/event-1/file.pdf'
        })
      })
    )
    expect(result.event).toEqual(mockEvent)
    expect(result.error).toBeUndefined()
    expect(revalidatePath).toHaveBeenCalledWith('/user-1/tracks/track-slug/event-1')
    expect(revalidatePath).toHaveBeenCalledWith('/user-1/tracks/track-slug')
  })

  it('returns error when fileUrl is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Missing required fields: fileUrl and key are required')
  })

  it('returns error when key is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Missing required fields: fileUrl and key are required')
  })

  it('handles API error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
      json: async () => ({ success: false, error: 'File not found' })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('File not found')
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Failed to confirm upload: Network error')
  })

  it('returns error when eventId is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
  })

  it('returns error when trackSlug is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
  })

  it('handles API error response without error message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Failed to confirm upload: Bad Request')
  })

  it('handles JSON parse error in error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toContain('Failed to confirm upload')
  })

  it('handles API response without data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Failed to confirm upload')
  })

  it('handles API response with success false but no error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    })

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Failed to confirm upload')
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const formData = new FormData()
    formData.append('userId', 'user-1')
    formData.append('eventId', 'event-1')
    formData.append('trackSlug', 'track-slug')
    formData.append('fileUrl', 'https://s3.amazonaws.com/file-url')
    formData.append('key', 'events/event-1/file.pdf')

    const result = await confirmEventUploadAction(formData)

    expect(result.error).toBe('Failed to confirm upload: Unknown error occurred')
  })
})

describe('deleteEventAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([])
    })
    ;(redirect as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('deletes event successfully and redirects', async () => {
    const mockResponse: ApiResponse<never> = {
      success: true
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    try {
      await deleteEventAction('user-1', 'track-slug', 'event-1')
    } catch (error: any) {
      // redirect throws an error in Next.js
      if (error.message !== 'NEXT_REDIRECT') {
        throw error
      }
    }

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-1/tracks/track-slug/events/event-1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: {}
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/user-1/tracks/track-slug')
    expect(redirect).toHaveBeenCalledWith('/user-1/tracks/track-slug')
  })

  it('returns error when eventId is missing', async () => {
    const result = await deleteEventAction('user-1', 'track-slug', '')

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns error when trackSlug is missing', async () => {
    const result = await deleteEventAction('user-1', '', 'event-1')

    expect(result.error).toBe('Missing required fields: userId, eventId and trackSlug are required')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
      json: async () => ({ success: false, error: 'Event not found' })
    })

    const result = await deleteEventAction('user-1', 'track-slug', 'event-1')

    expect(result.error).toBe('Event not found')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await deleteEventAction('user-1', 'track-slug', 'event-1')

    expect(result.error).toBe('Failed to delete event: Network error')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API error response without error message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ success: false })
    })

    const result = await deleteEventAction('user-1', 'track-slug', 'event-1')

    expect(result.error).toBe('Failed to delete event: Bad Request')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles JSON parse error in error response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const result = await deleteEventAction('user-1', 'track-slug', 'event-1')

    expect(result.error).toContain('Failed to delete event')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles API response with success false', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: 'Deletion failed' })
    })

    const result = await deleteEventAction('user-1', 'track-slug', 'event-1')

    expect(result.error).toBe('Deletion failed')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('handles non-Error exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

    const result = await deleteEventAction('user-1', 'track-slug', 'event-1')

    expect(result.error).toBe('Failed to delete event: Unknown error occurred')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('includes cookies in request when available', async () => {
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' },
        { name: 'token', value: 'token-value' }
      ])
    })

    const mockResponse: ApiResponse<never> = {
      success: true
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    try {
      await deleteEventAction('user-1', 'track-slug', 'event-1')
    } catch (error: any) {
      if (error.message !== 'NEXT_REDIRECT') {
        throw error
      }
    }

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: 'session=session-value; token=token-value'
        })
      })
    )
  })
})
