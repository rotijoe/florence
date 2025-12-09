import {
  formatEvent,
  verifyTrackExists,
  verifyEventInTrack,
  badRequestFromZod
} from '../helpers.js'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'
import { z } from 'zod'
import type { Context } from 'hono'

describe('Events Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formatEvent', () => {
    it('formats event without fileUrl', async () => {
      const event = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Notes',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const result = await formatEvent(event)

      expect(result).toEqual({
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Notes',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
    })

    it('formats event with fileUrl and generates presigned URL', async () => {
      const event = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Notes',
        fileUrl: 'https://bucket.s3.amazonaws.com/events/event-1/file.pdf',
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const result = await formatEvent(event)

      // Verify that fileUrl is a presigned URL (contains query parameters)
      expect(result.fileUrl).toBeDefined()
      expect(result.fileUrl).toContain('X-Amz-Signature')
      expect(result.fileUrl).not.toBe(event.fileUrl)
    })

    // Note: Testing S3 error handling requires complex mocking with ESM modules
    // The error handling logic is covered by integration tests in handler tests
  })

  describe('verifyTrackExists', () => {
    it('returns track when it exists', async () => {
      const mockTrack = { id: 'track-1' }
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>)

      const result = await verifyTrackExists('user-1', 'test-slug')

      expect(result).toEqual(mockTrack)
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: { userId: 'user-1', slug: 'test-slug' },
        select: { id: true }
      })

      findFirstSpy.mockRestore()
    })

    it('returns null when track does not exist', async () => {
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(null)

      const result = await verifyTrackExists('user-1', 'nonexistent-slug')

      expect(result).toBeNull()

      findFirstSpy.mockRestore()
    })
  })

  describe('verifyEventInTrack', () => {
    it('returns event when it exists in track', async () => {
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: null,
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      findFirstSpy.mockResolvedValue(mockEvent as unknown as Awaited<ReturnType<typeof prisma.event.findFirst>>)

      const result = await verifyEventInTrack('user-1', 'test-slug', 'event-1')

      expect(result.event).toEqual(mockEvent)
      expect(result.trackExists).toBe(true)

      findFirstSpy.mockRestore()
    })

    it('returns null event and checks track when event does not exist', async () => {
      const eventFindFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      eventFindFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({ id: 'track-1' } as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>)

      const result = await verifyEventInTrack('user-1', 'test-slug', 'nonexistent-event')

      expect(result.event).toBeNull()
      expect(result.trackExists).toBe(true)

      eventFindFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns null event and false trackExists when track does not exist', async () => {
      const eventFindFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      eventFindFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const result = await verifyEventInTrack('user-1', 'nonexistent-slug', 'event-1')

      expect(result.event).toBeNull()
      expect(result.trackExists).toBe(false)

      eventFindFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })
  })

  describe('badRequestFromZod', () => {
    it('formats Zod errors correctly', () => {
      const schema = z.object({
        title: z.string().min(1),
        age: z.number().min(18)
      })

      const result = schema.safeParse({ title: '', age: 15 })

      if (!result.success) {
        const mockContext = {
          json: jest.fn().mockReturnValue({ status: 400 })
        } as unknown as Context

        badRequestFromZod(mockContext, result.error)

        expect(mockContext.json).toHaveBeenCalledWith(
          {
            success: false,
            error: expect.stringContaining('title')
          },
          400
        )
      }
    })
  })
})
