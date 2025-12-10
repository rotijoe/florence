import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'

describe('Tracks API - Create Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/user/tracks', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/user/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Track'
        })
      })

      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 400 when title is missing', async () => {
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
      getSessionSpy.mockResolvedValue(mockSession)

      const res = await app.request('/api/user/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('title')

      getSessionSpy.mockRestore()
    })

    it('returns 400 when title is empty', async () => {
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
      getSessionSpy.mockResolvedValue(mockSession)

      const res = await app.request('/api/user/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: ''
        })
      })

      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('title')

      getSessionSpy.mockRestore()
    })

    it('creates a track with valid title and returns 201', async () => {
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

      const mockCreatedTrack = {
        id: 'track-new',
        userId: 'user-1',
        title: 'New Track',
        slug: 'new-track',
        description: 'Test description',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const createSpy = jest.spyOn(prisma.healthTrack, 'create')
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null) // No existing track with this slug
      createSpy.mockResolvedValue(
        mockCreatedTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.create>>
      )

      const res = await app.request('/api/user/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Track',
          description: 'Test description'
        })
      })

      expect(res.status).toBe(201)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        id: 'track-new',
        title: 'New Track',
        slug: 'new-track',
        description: 'Test description',
        userId: 'user-1'
      })

      getSessionSpy.mockRestore()
      createSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('generates unique slug when duplicate exists', async () => {
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

      const existingTrack = {
        id: 'track-existing',
        userId: 'user-1',
        title: 'Sleep',
        slug: 'sleep',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockCreatedTrack = {
        id: 'track-new',
        userId: 'user-1',
        title: 'Sleep',
        slug: 'sleep-2',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const createSpy = jest.spyOn(prisma.healthTrack, 'create')
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      // First call finds existing track with slug 'sleep', second call finds nothing (for 'sleep-2')
      findFirstSpy.mockResolvedValueOnce(existingTrack).mockResolvedValueOnce(null)
      createSpy.mockResolvedValue(
        mockCreatedTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.create>>
      )

      const res = await app.request('/api/user/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Sleep'
        })
      })

      expect(res.status).toBe(201)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.slug).toBe('sleep-2')

      getSessionSpy.mockRestore()
      createSpy.mockRestore()
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
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const createSpy = jest.spyOn(prisma.healthTrack, 'create')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null)
      createSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/user/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Track'
        })
      })

      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      createSpy.mockRestore()
    })
  })
})
