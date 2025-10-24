import { createTestApp } from '@/test-setup'
import { mockPrisma, mockAuth } from '@/test-helpers'

describe('GET /api/user/me', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Set up default mock behavior
    mockPrisma.healthTrack.findFirst.mockResolvedValue(null)
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.event.findMany.mockResolvedValue([])
    mockAuth.api.getSession.mockResolvedValue(null)
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
      user: { id: 'user-1' },
      session: { id: 'session-1' }
    }

    mockAuth.api.getSession.mockResolvedValue(mockSession)
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({
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
  })

  it('should return 404 when user is not found in database', async () => {
    const mockSession = {
      user: { id: 'user-1' },
      session: { id: 'session-1' }
    }

    mockAuth.api.getSession.mockResolvedValue(mockSession)
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('User not found')
  })

  it('should return user with empty tracks array', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      tracks: []
    }

    const mockSession = {
      user: { id: 'user-1' },
      session: { id: 'session-1' }
    }

    mockAuth.api.getSession.mockResolvedValue(mockSession)
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.tracks).toEqual([])
  })

  it('should handle database errors gracefully', async () => {
    const mockSession = {
      user: { id: 'user-1' },
      session: { id: 'session-1' }
    }

    mockAuth.api.getSession.mockResolvedValue(mockSession)
    mockPrisma.user.findUnique.mockRejectedValue(
      new Error('Database connection failed')
    )

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database connection failed')
  })

  it('should handle authentication errors gracefully', async () => {
    mockAuth.api.getSession.mockRejectedValue(
      new Error('Auth service unavailable')
    )

    const response = await app.request('/api/user/me')
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })
})
