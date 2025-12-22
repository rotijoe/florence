import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'
import { s3Client } from '@/lib/s3.js'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/auth'

let mockS3Send: jest.Mock

const createMockSession = (userId: string) => ({
  user: {
    id: userId,
    email: 'test@example.com',
    emailVerified: false,
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  session: {
    id: 'session-1',
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    token: 'test-token',
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
})

describe('Events API - Detail Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockS3Send = jest.spyOn(s3Client, 'send') as unknown as jest.Mock
    mockS3Send.mockResolvedValue(undefined)
  })

  afterEach(() => {
    mockS3Send.mockRestore()
  })

  describe('GET /api/users/:userId/tracks/:slug/events/:eventId', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1')
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when userId does not match authenticated user', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(createMockSession('user-2'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns 404 for missing track', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug/events/event-1')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 for missing event', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
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

      const res = await app.request('/api/users/user-1/tracks/test-track/events/nonexistent-event')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns event for valid slug and eventId', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/file.pdf',
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: 'NOTE',
        title: 'Test Event',
        notes: 'Test Description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
      expect(json.data.fileUrl).toBeDefined()

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })
  })

  describe('PATCH /api/users/:userId/tracks/:slug/events/:eventId', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when userId does not match authenticated user', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(createMockSession('user-2'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns 404 for missing track', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 for missing event', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
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

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/nonexistent-event',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title' })
        }
      )
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 400 for invalid title', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue({
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('title')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('successfully updates event title', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Original Title',
        notes: 'Original Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
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

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.title).toBe('Updated Title')
      expect(json.data.notes).toBe('Original Description')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('successfully updates event notes', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Title',
        notes: 'Original Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const updatedEvent = {
        ...mockEvent,
        notes: 'Updated Description',
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Updated Description' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.notes).toBe('Updated Description')
      expect(json.data.title).toBe('Test Title')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('successfully updates event with empty notes string (converts to null)', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Title',
        notes: 'Original Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const updatedEvent = {
        ...mockEvent,
        notes: null,
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.notes).toBeNull()

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      })
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })
  })

  describe('DELETE /api/users/:userId/tracks/:slug/events/:eventId', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when userId does not match authenticated user', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(createMockSession('user-2'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns 404 for missing track', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      expect(mockS3Send).not.toHaveBeenCalled()

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 for missing event', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
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

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/nonexistent-event',
        {
          method: 'DELETE'
        }
      )
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      expect(mockS3Send).not.toHaveBeenCalled()

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('successfully deletes event without attachment', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.event, 'delete')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      deleteSpy.mockResolvedValue(mockEvent as Awaited<ReturnType<typeof prisma.event.delete>>)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      expect(mockS3Send).not.toHaveBeenCalled()
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 'event-1' }
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
    })

    it('successfully deletes event with attachment', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/events/event-1/file.pdf',
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.event, 'delete')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      deleteSpy.mockResolvedValue(mockEvent as Awaited<ReturnType<typeof prisma.event.delete>>)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      expect(mockS3Send).toHaveBeenCalledTimes(1)
      const deleteCommand = mockS3Send.mock.calls[0][0] as DeleteObjectCommand
      expect(deleteCommand.input.Key).toBe('events/event-1/file.pdf')
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 'event-1' }
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
    })

    it('continues deletion even if S3 deletion fails', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/events/event-1/file.pdf',
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.event, 'delete')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      deleteSpy.mockResolvedValue(mockEvent as Awaited<ReturnType<typeof prisma.event.delete>>)
      mockS3Send.mockReset()
      mockS3Send.mockRejectedValue(new Error('S3 deletion failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 'event-1' }
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
    })

    it('handles event with fileUrl but invalid key gracefully', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: 'https://invalid-url.com/file.pdf', // Invalid S3 URL that won't extract key
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.event, 'delete')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      deleteSpy.mockResolvedValue(mockEvent as Awaited<ReturnType<typeof prisma.event.delete>>)

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      // Should not call S3 delete when key is invalid
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 'event-1' }
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events/event-1', {
        method: 'DELETE'
      })
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })
  })
})
