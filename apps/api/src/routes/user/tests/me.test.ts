import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'

describe('User API - Me Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/:userId', () => {
    it('returns 401 when user is not authenticated', async () => {
      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')
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

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns user data when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        tracks: [
          {
            id: 'track-1',
            title: 'Test Track',
            description: 'Test Description',
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
            userId: 'user-1',
            slug: 'test-track'
          }
        ]
      }

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
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

      getSessionSpy.mockResolvedValue(mockSession)
      findUniqueSpy.mockResolvedValue(mockUser)

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        tracks: [
          {
            id: 'track-1',
            title: 'Test Track',
            description: 'Test Description',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            userId: 'user-1',
            slug: 'test-track'
          }
        ]
      })

      getSessionSpy.mockRestore()
      findUniqueSpy.mockRestore()
    })

    it('returns 404 when user is not found in database', async () => {
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
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

      getSessionSpy.mockResolvedValue(mockSession)
      findUniqueSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('User not found')

      getSessionSpy.mockRestore()
      findUniqueSpy.mockRestore()
    })

    it('returns user with empty tracks array', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        tracks: []
      }

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
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

      getSessionSpy.mockResolvedValue(mockSession)
      findUniqueSpy.mockResolvedValue(mockUser)

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.tracks).toEqual([])

      getSessionSpy.mockRestore()
      findUniqueSpy.mockRestore()
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
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

      getSessionSpy.mockResolvedValue(mockSession)
      findUniqueSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findUniqueSpy.mockRestore()
    })
  })
})
