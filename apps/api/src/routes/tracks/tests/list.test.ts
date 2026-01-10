import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'

describe('Tracks API - List Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/:userId/tracks', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks')
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

      const res = await app.request('/api/users/user-1/tracks')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns empty array when user has no tracks', async () => {
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
      const findManySpy = jest.spyOn(prisma.healthTrack, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockResolvedValue([])

      const res = await app.request('/api/users/user-1/tracks')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toEqual([])

      expect(findManySpy).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: {
          id: true,
          userId: true,
          title: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

      getSessionSpy.mockRestore()
      findManySpy.mockRestore()
    })

    it('returns tracks array for authenticated user', async () => {
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

      const mockTracks = [
        {
          id: 'track-1',
          userId: 'user-1',
          title: 'Test Track 1',
          slug: 'test-track-1',
          description: 'Description 1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          id: 'track-2',
          userId: 'user-1',
          title: 'Test Track 2',
          slug: 'test-track-2',
          description: null,
          createdAt: new Date('2024-01-02T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z')
        }
      ]

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManySpy = jest.spyOn(prisma.healthTrack, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockResolvedValue(
        mockTracks as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findMany>>
      )

      const res = await app.request('/api/users/user-1/tracks')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(2)
      expect(json.data[0]).toEqual({
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track 1',
        slug: 'test-track-1',
        description: 'Description 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
      expect(json.data[1]).toEqual({
        id: 'track-2',
        userId: 'user-1',
        title: 'Test Track 2',
        slug: 'test-track-2',
        description: null,
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      })

      getSessionSpy.mockRestore()
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
      const findManySpy = jest.spyOn(prisma.healthTrack, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findManySpy.mockRestore()
    })
  })
})

