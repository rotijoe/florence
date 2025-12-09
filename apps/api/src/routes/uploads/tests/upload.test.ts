import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'
import { auth } from '@/auth'
import { s3Client } from '@/lib/s3.js'

let mockS3Send: jest.Mock

describe('Uploads API - Upload Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockS3Send = jest.spyOn(s3Client, 'send') as unknown as jest.Mock
    mockS3Send.mockResolvedValue(undefined)
  })

  afterEach(() => {
    mockS3Send.mockRestore()
  })

  describe('POST /api/tracks/:slug/events/:eventId/upload-url', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      })
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 400 for invalid fileName', async () => {
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

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: '',
          contentType: 'application/pdf',
          size: 1024
        })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('fileName')

      getSessionSpy.mockRestore()
    })

    it('returns 400 for invalid contentType', async () => {
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

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'invalid/type',
          size: 1024
        })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('contentType')

      getSessionSpy.mockRestore()
    })

    it('returns 400 for file size exceeding limit', async () => {
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

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          size: 11 * 1024 * 1024 // 11MB, exceeds 10MB limit
        })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('size')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when track does not exist', async () => {
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
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/tracks/nonexistent-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 when event does not exist', async () => {
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
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({ id: 'track-1' } as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>)

      const res = await app.request('/api/tracks/test-slug/events/nonexistent-event/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('successfully generates upload URL', async () => {
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

      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1'
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockEvent as unknown as Awaited<ReturnType<typeof prisma.event.findFirst>>)

      // Mock S3 send to simulate successful presigned URL generation
      // The actual getSignedUrl will be called internally

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveProperty('uploadUrl')
      expect(json.data).toHaveProperty('fileUrl')
      expect(json.data).toHaveProperty('key')
      expect(json.data).toHaveProperty('expiresAt')
      expect(json.data.maxSize).toBe(10 * 1024 * 1024)
      expect(json.data.allowedContentTypes).toBeDefined()

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })
  })

  describe('POST /api/tracks/:slug/events/:eventId/upload-confirm', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
          key: 'events/event-1/file.pdf'
        })
      })
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('returns 400 for invalid fileUrl', async () => {
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

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'not-a-valid-url',
          key: 'events/event-1/file.pdf'
        })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('fileUrl')

      getSessionSpy.mockRestore()
    })

    it('returns 400 for invalid key', async () => {
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

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
          key: ''
        })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('key')

      getSessionSpy.mockRestore()
    })

    it('returns 404 when file not found in S3', async () => {
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

      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1'
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockEvent as unknown as Awaited<ReturnType<typeof prisma.event.findFirst>>)
      mockS3Send.mockRejectedValueOnce(new Error('Not found'))

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
          key: 'events/event-1/file.pdf'
        })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('File not found in storage. Please upload the file first.')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('successfully confirms upload and updates event', async () => {
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

      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1'
      }

      const updatedEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: new Date('2024-01-01T00:00:00Z'),
        type: EventType.NOTE,
        title: 'Test Event',
        notes: null,
        fileUrl: 'https://bucket.s3.amazonaws.com/events/event-1/file.pdf',
        symptomType: null,
        severity: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const updateSpy = jest.spyOn(prisma.event, 'update')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(mockEvent as unknown as Awaited<ReturnType<typeof prisma.event.findFirst>>)
      updateSpy.mockResolvedValue(updatedEvent as unknown as Awaited<ReturnType<typeof prisma.event.update>>)

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'https://bucket.s3.amazonaws.com/events/event-1/file.pdf',
          key: 'events/event-1/file.pdf'
        })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveProperty('fileUrl')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      updateSpy.mockRestore()
    })

    it('returns 404 when track does not exist for upload-confirm', async () => {
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
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const res = await app.request('/api/tracks/nonexistent-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
          key: 'events/event-1/file.pdf'
        })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns 404 when event does not exist for upload-confirm', async () => {
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
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({ id: 'track-1' } as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>)

      const res = await app.request(
        '/api/tracks/test-slug/events/nonexistent-event/upload-confirm',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
            key: 'events/event-1/file.pdf'
          })
        }
      )
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Event not found')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('handles database errors gracefully for upload-confirm', async () => {
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
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
          key: 'events/event-1/file.pdf'
        })
      })
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })

    it('handles database errors gracefully for upload-url', async () => {
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
      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findFirstSpy.mockRejectedValue(new Error('Database connection failed'))

      const res = await app.request('/api/tracks/test-slug/events/event-1/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      })
      expect(res.status).toBe(500)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Database connection failed')

      getSessionSpy.mockRestore()
      findFirstSpy.mockRestore()
    })
  })
})
