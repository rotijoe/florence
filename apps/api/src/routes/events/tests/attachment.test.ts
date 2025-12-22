import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'
import { s3Client } from '@/lib/s3/index.js'
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

describe('Events API - Attachment Handler', () => {
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

  describe('DELETE /api/users/:userId/tracks/:slug/events/:eventId/attachment', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when userId does not match authenticated user', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(createMockSession('user-2'))

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
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

      const res = await app.request(
        '/api/users/user-1/tracks/nonexistent-slug/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
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
        '/api/users/user-1/tracks/test-track/events/nonexistent-event/attachment',
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

    it('successfully deletes attachment when event has fileUrl', async () => {
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

      const updatedEvent = {
        ...mockEvent,
        fileUrl: null,
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      updateSpy.mockResolvedValue(updatedEvent)

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.fileUrl).toBeNull()

      expect(mockS3Send).toHaveBeenCalledTimes(1)
      const deleteCommand = mockS3Send.mock.calls[0][0] as DeleteObjectCommand
      expect(deleteCommand.input.Key).toBe('events/event-1/file.pdf')
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: { fileUrl: null, updatedAt: expect.any(Date) },
        select: expect.any(Object)
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('handles event with no attachment gracefully', async () => {
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

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event has no attachment to delete')

      expect(mockS3Send).not.toHaveBeenCalled()

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    // Note: Testing invalid fileUrl (key extraction fails) requires mocking ESM modules
    // which is complex with Jest ESM. The error handling is covered by integration tests.

    it('handles S3 deletion errors gracefully', async () => {
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

      getSessionSpy.mockResolvedValue(createMockSession('user-1'))
      findFirstSpy.mockResolvedValue(mockEvent)
      mockS3Send.mockReset()
      mockS3Send.mockRejectedValue(new Error('S3 deletion failed'))

      const res = await app.request(
        '/api/users/user-1/tracks/test-track/events/event-1/attachment',
        {
          method: 'DELETE'
        }
      )
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('S3 deletion failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })
  })
})
