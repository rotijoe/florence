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

  describe('GET /api/users/:userId/tracks/:slug', () => {
    it('returns 404 when userId does not match', async () => {
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      // Verify query was made with userId and slug
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: { userId: 'user-1', slug: 'test-track' },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true
        }
      })

      findFirstSpy.mockRestore()
    })

    it('returns 404 when slug does not exist for user', async () => {
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/nonexistent-slug')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      findFirstSpy.mockRestore()
    })

    it('returns track data for valid userId and slug', async () => {
      const mockTrack = {
        id: 'track-1',
        title: 'Test Track',
        slug: 'test-track',
        userId: 'user-1',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(mockTrack)

      const res = await app.request('/api/users/user-1/tracks/test-track')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toEqual({
        id: 'track-1',
        name: 'Test Track',
        slug: 'test-track',
        createdAt: '2024-01-01T00:00:00.000Z'
      })

      // Verify query was made with correct userId and slug
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: { userId: 'user-1', slug: 'test-track' },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true
        }
      })

      findFirstSpy.mockRestore()
    })

    it('returns 404 when track exists but belongs to different user', async () => {
      // Track exists for user-2, but we're querying for user-1
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/sleep')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      findFirstSpy.mockRestore()
    })

    it('handles database errors gracefully', async () => {
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track')
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      findFirstSpy.mockRestore()
    })
  })
})
