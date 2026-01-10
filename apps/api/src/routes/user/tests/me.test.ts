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

    it('returns user profile data when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
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
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique') as jest.MockedFunction<typeof prisma.user.findUnique>

      getSessionSpy.mockResolvedValue(mockSession)
      // Mock should return only the fields selected in the query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findUniqueSpy.mockImplementation((async (args: Parameters<typeof prisma.user.findUnique>[0]): Promise<any> => {
        if (args?.select) {
          // Return only selected fields
          return {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com'
          }
        }
        return mockUser
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any)

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      })

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          name: true,
          email: true
        }
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

    it('returns user profile without tracks', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
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
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique') as jest.MockedFunction<typeof prisma.user.findUnique>

      getSessionSpy.mockResolvedValue(mockSession)
      // Mock should return only the fields selected in the query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findUniqueSpy.mockImplementation((async (args: Parameters<typeof prisma.user.findUnique>[0]): Promise<any> => {
        if (args?.select) {
          // Return only selected fields
          return {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com'
          }
        }
        return mockUser
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any)

      const res = await app.request('/api/users/user-1')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      })
      expect(json.data).not.toHaveProperty('tracks')

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
