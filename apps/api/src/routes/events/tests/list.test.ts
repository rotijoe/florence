import { createTestApp } from '@/test-setup'
import { prismaRuntime } from '@packages/database'
import { EventType } from '@packages/types'
import { auth } from '@/auth'
import { encryptEventContent } from '@/lib/crypto/index.js'

const mockFormatEvent = jest.fn()
jest.mock('@/helpers/index.js', () => ({
  ...jest.requireActual('@/helpers/index.js'),
  formatEvent: () => mockFormatEvent()
}))

describe('Events API - List Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/:userId/tracks/:slug/events', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track/events')
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when userId does not match authenticated user', async () => {
      const mockSession = {
        user: {
          id: 'user-2',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-2',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(mockSession)

      const res = await app.request('/api/users/user-1/tracks/test-track/events')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns 404 for missing slug', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prismaRuntime.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockResolvedValue([])
      findFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug/events')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('returns events for valid slug with default limit', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      const contentEnc = encryptEventContent({
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null
      })

      const mockEvents = [
        {
          id: 'event-1',
          trackId: 'track-1',
          date: new Date('2024-01-01T00:00:00Z'),
          type: EventType.NOTE,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          content: {
            contentEnc: new Uint8Array(contentEnc)
          }
        }
      ]

      const formattedEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prismaRuntime.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue(mockEvents)
      mockFormatEvent.mockResolvedValue(formattedEvent)

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

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
      mockFormatEvent.mockReset()
    })

    it('respects limit query parameter', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      const contentEnc = encryptEventContent({
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null
      })

      const mockEvents = Array.from({ length: 5 }, (_, i) => ({
        id: `event-${i + 1}`,
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        content: {
          contentEnc: new Uint8Array(contentEnc)
        }
      }))

      const findFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prismaRuntime.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue(mockEvents)
      mockFormatEvent.mockResolvedValue({
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test Description',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })

      const res = await app.request('/api/users/user-1/tracks/test-track/events?limit=3')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(5)

      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 3,
        select: expect.any(Object)
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
      mockFormatEvent.mockReset()
    })

    it('enforces maximum limit of 1000', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      const findFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prismaRuntime.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/users/user-1/tracks/test-track/events?limit=2000')
      expect(res.status).toBe(200)

      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 1000,
        select: expect.any(Object)
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('enforces minimum limit of 1', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const mockTrack = {
        id: 'track-1',
        slug: 'test-track',
        userId: 'user-1',
        title: 'Test Track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
      const findFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const findManySpy = jest.spyOn(prismaRuntime.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockTrack)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/users/user-1/tracks/test-track/events?limit=0')
      expect(res.status).toBe(200)

      expect(findManySpy).toHaveBeenCalledWith({
        where: { track: { slug: 'test-track' } },
        orderBy: { date: 'desc' },
        take: 1,
        select: expect.any(Object)
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: 'test-token',
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManySpy = jest.spyOn(prismaRuntime.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findManySpy.mockRestore()
    })
  })
})
