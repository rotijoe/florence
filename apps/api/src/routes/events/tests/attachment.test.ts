import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'
import { s3Client } from '@/lib/s3.js'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

let mockS3Send: jest.Mock

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
    it('returns 404 for missing track', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

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

      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('successfully deletes attachment when event has fileUrl', async () => {
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

      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('handles event with no attachment gracefully', async () => {
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

      findFirstSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
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

      findFirstSpy.mockRestore()
    })

    // Note: Testing invalid fileUrl (key extraction fails) requires mocking ESM modules
    // which is complex with Jest ESM. The error handling is covered by integration tests.

    it('handles S3 deletion errors gracefully', async () => {
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

      findFirstSpy.mockRestore()
    })
  })
})
