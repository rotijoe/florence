import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'
import { s3Client } from '@/lib/s3/index.js'

describe('Tracks API - Delete Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE /api/users/:userId/tracks/:slug', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/test-track', {
        method: 'DELETE'
      })

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

      const res = await app.request('/api/users/user-1/tracks/test-track', {
        method: 'DELETE'
      })

      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when track not found', async () => {
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

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/tracks/non-existent-track', {
        method: 'DELETE'
      })

      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('deletes track and associated events successfully', async () => {
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

      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        events: []
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.healthTrack, 'delete')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(
        mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>
      )
      deleteSpy.mockResolvedValue(
        mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.delete>>
      )

      const res = await app.request('/api/users/user-1/tracks/test-track', {
        method: 'DELETE'
      })

      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      expect(findFirstSpy).toHaveBeenCalledWith({
        where: { userId: 'user-1', slug: 'test-track' },
        include: {
          events: {
            select: {
              fileUrl: true
            }
          }
        }
      })
      expect(deleteSpy).toHaveBeenCalledWith({
        where: {
          id: 'track-1'
        }
      })

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
    })

    it('deletes S3 files for events with attachments before deleting track', async () => {
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

      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        events: [
          {
            fileUrl: 'https://bucket.s3.region.amazonaws.com/events/event-1/file.pdf'
          },
          {
            fileUrl: null
          },
          {
            fileUrl: 'https://bucket.s3.region.amazonaws.com/events/event-2/document.pdf'
          }
        ]
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.healthTrack, 'delete')
      const s3SendSpy = jest.spyOn(s3Client, 'send').mockResolvedValue({} as never)

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(
        mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>
      )
      deleteSpy.mockResolvedValue(
        mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.delete>>
      )

      const res = await app.request('/api/users/user-1/tracks/test-track', {
        method: 'DELETE'
      })

      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      // Verify S3 delete was called for events with fileUrl (2 events have fileUrl)
      expect(s3SendSpy).toHaveBeenCalledTimes(2)

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
      s3SendSpy.mockRestore()
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

      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        events: []
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
      const deleteSpy = jest.spyOn(prisma.healthTrack, 'delete')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(
        mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>
      )
      deleteSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/users/user-1/tracks/test-track', {
        method: 'DELETE'
      })

      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      deleteSpy.mockRestore()
    })
  })
})
