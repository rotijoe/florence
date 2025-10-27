import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'

describe('Tracks API', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
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

      // Use jest.spyOn to mock the database call
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(mockTrack)

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

      // Clean up the spy
      findFirstSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      // Use jest.spyOn to mock the database call to throw an error
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/tracks/test-track')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      // Clean up the spy
      findFirstSpy.mockRestore()
    })
  })
})
