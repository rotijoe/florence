import { createTestApp } from '@/test-setup'
import { prismaRuntime } from '@packages/database'
import { EventType } from '@packages/types'
import { auth } from '@/auth'
import { encryptEventContent } from '@/lib/crypto/index.js'

const mockFormatEvent = jest.fn()

jest.mock('@/helpers/index.js', () => ({
  ...jest.requireActual('@/helpers/index.js'),
  formatEvent: (...args: unknown[]) => mockFormatEvent(...args)
}))

describe('Events API - Create Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/users/:userId/tracks/:slug/events', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
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

      const res = await app.request('/api/users/user-1/tracks/test-track/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when track does not exist', async () => {
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
      const trackFindFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      trackFindFirstSpy.mockResolvedValue(null) // Track doesn't exist

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('successfully creates event with defaults', async () => {
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

      const defaultContentEnc = encryptEventContent({
        title: 'Untitled event',
        notes: null,
        fileUrl: null,
        symptomType: null,
        severity: null
      })

      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        content: {
          contentEnc: new Uint8Array(defaultContentEnc)
        }
      }

      const formattedEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: EventType.NOTE,
        title: 'Untitled event',
        notes: null,
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const trackFindFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const eventCreateSpy = jest.spyOn(prismaRuntime.event, 'create')

      getSessionSpy.mockResolvedValue(mockSession)
      trackFindFirstSpy.mockResolvedValue(mockTrack)
      eventCreateSpy.mockResolvedValue(mockEvent)
      mockFormatEvent.mockResolvedValue(formattedEvent)

      const res = await app.request('/api/users/user-1/tracks/test-track/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      expect(res.status).toBe(201)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        id: 'event-1',
        trackId: 'track-1',
        type: 'NOTE',
        title: 'Untitled event',
        notes: null
      })

      getSessionSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
      eventCreateSpy.mockRestore()
    })

    it('successfully creates event with provided data', async () => {
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
        title: 'Custom Title',
        notes: 'Custom Notes',
        fileUrl: null,
        symptomType: null,
        severity: null
      })

      const mockEvent = {
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

      const formattedEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: EventType.NOTE,
        title: 'Custom Title',
        notes: 'Custom Notes',
        fileUrl: null,
        symptomType: null,
        severity: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const trackFindFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')
      const eventCreateSpy = jest.spyOn(prismaRuntime.event, 'create')

      getSessionSpy.mockResolvedValue(mockSession)
      trackFindFirstSpy.mockResolvedValue(mockTrack)
      eventCreateSpy.mockResolvedValue(mockEvent)
      mockFormatEvent.mockResolvedValue(formattedEvent)

      const res = await app.request('/api/users/user-1/tracks/test-track/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Custom Title',
          type: EventType.NOTE,
          notes: 'Custom Notes'
        })
      })
      expect(res.status).toBe(201)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        id: 'event-1',
        trackId: 'track-1',
        type: 'NOTE',
        title: 'Custom Title',
        notes: 'Custom Notes'
      })

      getSessionSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
      eventCreateSpy.mockRestore()
    })

    it('returns 400 for invalid title', async () => {
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

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockTrack)

      const res = await app.request('/api/users/user-1/tracks/test-track/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ''
        })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('title')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
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
      const trackFindFirstSpy = jest.spyOn(prismaRuntime.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      trackFindFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })
  })
})
