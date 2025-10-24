import { createTestApp } from '@/test-setup'
import { mockPrisma } from '@/test-helpers'

describe('Tracks API', () => {
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
  })

  describe('GET /api/tracks/:slug', () => {
    it('returns 404 for missing slug', async () => {
      const res = await app.request('/api/tracks/nonexistent-slug')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')
    })

    it('returns track data for valid slug', async () => {
      const mockTrack = {
        id: 'track-1',
        title: 'Test Track',
        slug: 'test-track',
        createdAt: new Date('2024-01-01T00:00:00Z')
      }

      mockPrisma.healthTrack.findFirst.mockResolvedValue(mockTrack)

      const res = await app.request('/api/tracks/test-track')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toEqual({
        id: 'track-1',
        name: 'Test Track',
        slug: 'test-track',
        createdAt: '2024-01-01T00:00:00.000Z'
      })
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.healthTrack.findFirst.mockRejectedValue(
        new Error('Database connection failed')
      )

      const res = await app.request('/api/tracks/test-track')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')
    })
  })

  describe('GET /api/tracks/:slug/events', () => {
    it('returns 404 for missing slug', async () => {
      const res = await app.request('/api/tracks/nonexistent-slug/events')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')
    })

    it('returns events for valid slug with default limit', async () => {
      const mockTrack = { id: 'track-1' }
      const mockEvents = [
        {
          id: 'event-1',
          trackId: 'track-1',
          date: new Date('2024-01-01T00:00:00Z'),
          type: 'NOTE',
          title: 'Test Event',
          description: 'Test Description',
          fileUrl: null,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z')
        }
      ]

      mockPrisma.healthTrack.findFirst.mockResolvedValue(mockTrack)
      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const res = await app.request('/api/tracks/test-track/events')
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
        description: 'Test Description',
        fileUrl: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
    })

    it('respects limit query parameter', async () => {
      const mockTrack = { id: 'track-1' }
      const mockEvents = Array.from({ length: 5 }, (_, i) => ({
        id: `event-${i + 1}`,
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: 'NOTE',
        title: `Test Event ${i + 1}`,
        description: 'Test Description',
        fileUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }))

      mockPrisma.healthTrack.findFirst.mockResolvedValue(mockTrack)
      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const res = await app.request('/api/tracks/test-track/events?limit=3')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(5)

      // Verify that findMany was called with the correct limit
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { trackId: 'track-1' },
        orderBy: { date: 'desc' },
        take: 3,
        select: expect.any(Object)
      })
    })

    it('enforces maximum limit of 1000', async () => {
      const mockTrack = { id: 'track-1' }
      mockPrisma.healthTrack.findFirst.mockResolvedValue(mockTrack)
      mockPrisma.event.findMany.mockResolvedValue([])

      const res = await app.request('/api/tracks/test-track/events?limit=2000')
      expect(res.status).toBe(200)

      // Verify that findMany was called with limit 1000 (capped)
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { trackId: 'track-1' },
        orderBy: { date: 'desc' },
        take: 1000,
        select: expect.any(Object)
      })
    })

    it('enforces minimum limit of 1', async () => {
      const mockTrack = { id: 'track-1' }
      mockPrisma.healthTrack.findFirst.mockResolvedValue(mockTrack)
      mockPrisma.event.findMany.mockResolvedValue([])

      const res = await app.request('/api/tracks/test-track/events?limit=0')
      expect(res.status).toBe(200)

      // Verify that findMany was called with limit 1 (minimum)
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { trackId: 'track-1' },
        orderBy: { date: 'desc' },
        take: 1,
        select: expect.any(Object)
      })
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.healthTrack.findFirst.mockRejectedValue(
        new Error('Database connection failed')
      )

      const res = await app.request('/api/tracks/test-track/events')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')
    })
  })
})
