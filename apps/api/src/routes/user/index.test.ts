import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'

describe('GET /api/user/me', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    const response = await app.request('/api/user/me')
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return user data when authenticated', async () => {
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

    // Use jest.spyOn to mock the auth and database calls
    const getSessionSpy = jest.spyOn(auth.api, 'getSession')
    const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

    getSessionSpy.mockResolvedValue(mockSession)
    findUniqueSpy.mockResolvedValue(mockUser)

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toMatchObject({
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

    // Clean up the spies
    getSessionSpy.mockRestore()
    findUniqueSpy.mockRestore()
  })

  it('should return 404 when user is not found in database', async () => {
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

    // Use jest.spyOn to mock the auth and database calls
    const getSessionSpy = jest.spyOn(auth.api, 'getSession')
    const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

    getSessionSpy.mockResolvedValue(mockSession)
    findUniqueSpy.mockResolvedValue(null)

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('User not found')

    // Clean up the spies
    getSessionSpy.mockRestore()
    findUniqueSpy.mockRestore()
  })

  it('should return user with empty tracks array', async () => {
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

    // Use jest.spyOn to mock the auth and database calls
    const getSessionSpy = jest.spyOn(auth.api, 'getSession')
    const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

    getSessionSpy.mockResolvedValue(mockSession)
    findUniqueSpy.mockResolvedValue(mockUser)

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.tracks).toEqual([])

    // Clean up the spies
    getSessionSpy.mockRestore()
    findUniqueSpy.mockRestore()
  })

  it('should handle database errors gracefully', async () => {
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

    // Use jest.spyOn to mock the auth and database calls
    const getSessionSpy = jest.spyOn(auth.api, 'getSession')
    const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique')

    getSessionSpy.mockResolvedValue(mockSession)
    findUniqueSpy.mockRejectedValue(new Error('Database connection failed'))

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database connection failed')

    // Clean up the spies
    getSessionSpy.mockRestore()
    findUniqueSpy.mockRestore()
  })

  it('should handle authentication errors gracefully', async () => {
    // Suppress console.error for this test since we're intentionally testing error handling
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Use jest.spyOn to mock the auth call to throw an error
    const getSessionSpy = jest.spyOn(auth.api, 'getSession')
    getSessionSpy.mockRejectedValue(new Error('Auth service unavailable'))

    // Hono's default error handler catches the error and returns a 500 response
    const response = await app.request('/api/user/me')
    expect(response.status).toBe(500)

    // Clean up the spies
    getSessionSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })
})
