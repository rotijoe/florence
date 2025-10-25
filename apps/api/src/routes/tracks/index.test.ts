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
})
