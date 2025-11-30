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

describe('POST /api/user/tracks', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    const response = await app.request('/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Track'
      })
    })

    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 when title is missing', async () => {
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

    const response = await app.request('/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Title')

    getSessionSpy.mockRestore()
  })

  it('should return 400 when title is empty', async () => {
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

    const response = await app.request('/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: ''
      })
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Title')

    getSessionSpy.mockRestore()
  })

  it('should create a track with valid title and return 201', async () => {
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
    createSpy.mockResolvedValue(mockCreatedTrack)

    const response = await app.request('/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'New Track',
        description: 'Test description'
      })
    })

    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toMatchObject({
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

  it('should generate unique slug when duplicate exists', async () => {
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
    createSpy.mockResolvedValue(mockCreatedTrack)

    const response = await app.request('/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Sleep'
      })
    })

    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.slug).toBe('sleep-2')

    getSessionSpy.mockRestore()
    createSpy.mockRestore()
    findFirstSpy.mockRestore()
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

    const getSessionSpy = jest.spyOn(auth.api, 'getSession')
    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    const createSpy = jest.spyOn(prisma.healthTrack, 'create')

    getSessionSpy.mockResolvedValue(mockSession)
    findFirstSpy.mockResolvedValue(null)
    createSpy.mockRejectedValue(new Error('Database connection failed'))

    const response = await app.request('/api/user/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Track'
      })
    })

    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database connection failed')

    getSessionSpy.mockRestore()
    findFirstSpy.mockRestore()
    createSpy.mockRestore()
  })
})
