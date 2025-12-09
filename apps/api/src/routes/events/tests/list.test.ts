import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'

describe('Events API - List Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/:userId/tracks/:slug/events', () => {
    it('returns 404 for missing slug', async () => {
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findManySpy.mockResolvedValue([])
      findFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug/events')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
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
          notes: 'Test Description',
          fileUrl: null,
          symptomType: null,
          severity: null,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z')
        }
      ]

      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue(mockEvents)

      const res = await app.request('/api/users/user-1/tracks/test-track/events')
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
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })

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
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }))

      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue(mockEvents)

      const res = await app.request('/api/users/user-1/tracks/test-track/events?limit=3')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(5)

      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { userId: 'user-1', slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 3,
        select: expect.any(Object)
      })

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
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/users/user-1/tracks/test-track/events?limit=2000')
      expect(res.status).toBe(200)

      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { userId: 'user-1', slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 1000,
        select: expect.any(Object)
      })

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
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prisma.event, 'findMany')

      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/users/user-1/tracks/test-track/events?limit=0')
      expect(res.status).toBe(200)

      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { userId: 'user-1', slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 1,
        select: expect.any(Object)
      })

      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      findFirstSpy.mockRestore()
    })
  })
})
