// Mock the S3 module before imports
const mockGetPresignedDownloadUrl = jest.fn()
const mockGetObjectKeyFromUrl = jest.fn((url: string) => {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    return decodeURIComponent(urlObj.pathname.slice(1))
  } catch {
    return null
  }
})

jest.mock('@/lib/s3.js', () => ({
  getPresignedDownloadUrl: mockGetPresignedDownloadUrl,
  getObjectKeyFromUrl: mockGetObjectKeyFromUrl
}))

import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'

describe('Events API', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    // Reset the presigned URL mock
    mockGetPresignedDownloadUrl.mockReset()
  })

  describe('GET /api/tracks/:slug/events', () => {
    it('returns 404 for missing slug', async () => {
      const res = await app.request('/api/tracks/nonexistent-slug/events')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')
    })

    it('returns events for valid slug with default limit', async () => {
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      const mockEvents = [
        {
          id: 'event-1',
          trackId: 'track-1',
          date: new Date('2024-01-01T00:00:00Z'),
          type: EventType.NOTE,
          title: 'Test Event',
          description: 'Test Description',
          fileUrl: null,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z')
        }
      ]

      // Use jest.spyOn to mock the database calls
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue(mockEvents)

      const res = await app.request('/api/tracks/test-track/events')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(1)
      expect(json.data[0]).toEqual({
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: 'NOTE',
        title: 'Test Event',
        description: 'Test Description',
        fileUrl: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })

      // Clean up the spies
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('respects limit query parameter', async () => {
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      const mockEvents = Array.from({ length: 5 }, (_, i) => ({
        id: `event-${i + 1}`,
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: `Test Event ${i + 1}`,
        description: 'Test Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }))

      // Use jest.spyOn to mock the database calls
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue(mockEvents)

      const res = await app.request('/api/tracks/test-track/events?limit=3')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(5)

      // Verify that findMany was called with the correct limit
      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 3,
        select: expect.any(Object)
      })

      // Clean up the spies
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('enforces maximum limit of 1000', async () => {
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      // Use jest.spyOn to mock the database calls
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/tracks/test-track/events?limit=2000')
      expect(res.status).toBe(200)

      // Verify that findMany was called with limit 1000 (capped)
      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 1000,
        select: expect.any(Object)
      })

      // Clean up the spies
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('enforces minimum limit of 1', async () => {
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      // Use jest.spyOn to mock the database calls
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/tracks/test-track/events?limit=0')
      expect(res.status).toBe(200)

      // Verify that findMany was called with limit 1 (minimum)
      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 1,
        select: expect.any(Object)
      })

      // Clean up the spies
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      // Use jest.spyOn to mock the database call to throw an error
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/tracks/test-track/events')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      // Clean up the spy
      findFirstSpy.mockRestore()
    })
  })

  describe('GET /api/tracks/:slug/events/:eventId', () => {
    it('returns 404 for missing track', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/tracks/nonexistent-slug/events/event-1')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 for missing event', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const res = await app.request('/api/tracks/test-track/events/nonexistent-event')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 for event that does not belong to track', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const res = await app.request('/api/tracks/test-track/events/other-track-event')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns event for valid slug and eventId', async () => {
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        description: 'Test Description',
        fileUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/file.pdf',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      
      findFirstSpy.mockResolvedValue(mockEvent)

      const res = await app.request('/api/tracks/test-track/events/event-1')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: 'NOTE',
        title: 'Test Event',
        description: 'Test Description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
      // Verify that fileUrl is a presigned S3 URL
      expect(json.data.fileUrl).toBeDefined()
      expect(json.data.fileUrl).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/file.pdf')
      expect(json.data.fileUrl).toContain('X-Amz-Signature')
      expect(json.data.fileUrl).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256')

      findFirstSpy.mockRestore()
      mockGetPresignedDownloadUrl.mockClear()
    })

    it('handles database errors gracefully', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/tracks/test-track/events/event-1')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      findFirstSpy.mockRestore()
    })
  })

  describe('PATCH /api/tracks/:slug/events/:eventId', () => {
    it('returns 404 for missing track', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/tracks/nonexistent-slug/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 for missing event', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const res = await app.request('/api/tracks/test-track/events/nonexistent-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 400 for invalid title', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      findFirstSpy.mockResolvedValue({
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        description: 'Test Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const res = await app.request('/api/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Title is required and must be a non-empty string')

      findFirstSpy.mockRestore()
    })

    it('returns 400 for invalid description type', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      findFirstSpy.mockResolvedValue({
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        description: 'Test Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const res = await app.request('/api/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 123 })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Description must be a string or null')

      findFirstSpy.mockRestore()
    })

    it('successfully updates event title', async () => {
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Original Title',
        description: 'Original Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const updatedEvent = {
        ...mockEvent,
        title: 'Updated Title',
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      findFirstSpy.mockResolvedValue({
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        description: 'Test Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request('/api/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.title).toBe('Updated Title')
      expect(json.data.description).toBe('Original Description')

      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('successfully updates event description', async () => {
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Title',
        description: 'Original Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const updatedEvent = {
        ...mockEvent,
        description: 'Updated Description',
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      findFirstSpy.mockResolvedValue(mockEvent)
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request('/api/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Updated Description' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.description).toBe('Updated Description')
      expect(json.data.title).toBe('Test Title')

      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('successfully updates both title and description', async () => {
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Original Title',
        description: 'Original Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const updatedEvent = {
        ...mockEvent,
        title: 'Updated Title',
        description: 'Updated Description',
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      findFirstSpy.mockResolvedValue(mockEvent)
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request('/api/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title', description: 'Updated Description' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.title).toBe('Updated Title')
      expect(json.data.description).toBe('Updated Description')

      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      findFirstSpy.mockRestore()
    })
  })
})
