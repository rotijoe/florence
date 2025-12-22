import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'
import { createMockSession } from '@/test-helpers'

describe('User API - Hub Notifications', () => {
  let app: ReturnType<typeof createTestApp>

  const mockSession = createMockSession('user-1')

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/:userId/hub/notifications', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications')
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

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns EventMissingDetails notification for past event within 7 days with no note and no upload', async () => {
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: threeDaysAgo,
        title: 'Test Appointment',
        track: {
          slug: 'test-track',
          title: 'Test Track'
        }
      } as {
        id: string
        trackId: string
        date: Date
        title: string
        track: {
          slug: string
          title: string
        }
      }

      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManyEventsSpy = jest.spyOn(prisma.event, 'findMany')
      const findManyDismissalsSpy = jest.spyOn(prisma.hubDismissal, 'findMany')
      const findManyTracksSpy = jest.spyOn(prisma.healthTrack, 'findMany')
      const findFirstEventSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findManyEventsSpy.mockResolvedValue([mockEvent as any])
      findManyDismissalsSpy.mockResolvedValue([])
      findManyTracksSpy.mockResolvedValue([mockTrack])
      // Handler calls findFirst twice per track (main loop + cleanup), return null for no recent symptom
      findFirstEventSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
      expect(Array.isArray(json.data)).toBe(true)
      expect(json.data.length).toBeGreaterThan(0)

      const eventNotification = json.data.find(
        (n: { type: string }) => n.type === 'appointmentDetails'
      )
      expect(eventNotification).toBeDefined()
      expect(eventNotification.id).toBeDefined()
      expect(eventNotification.title).toBeDefined()
      expect(eventNotification.message).toBeDefined()
      expect(eventNotification.ctaLabel).toBeDefined()

      getSessionSpy.mockRestore()
      findManyEventsSpy.mockRestore()
      findManyDismissalsSpy.mockRestore()
      findManyTracksSpy.mockRestore()
      findFirstEventSpy.mockRestore()
    })

    it('returns TrackMissingSymptom notification for track with no symptom logged in last 7 days', async () => {
      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManyTracksSpy = jest.spyOn(prisma.healthTrack, 'findMany')
      const findFirstEventSpy = jest.spyOn(prisma.event, 'findFirst')
      const findManyDismissalsSpy = jest.spyOn(prisma.hubDismissal, 'findMany')
      const findManyEventsSpy = jest.spyOn(prisma.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManyTracksSpy.mockResolvedValue([mockTrack])
      findManyDismissalsSpy.mockResolvedValue([])
      findManyEventsSpy.mockResolvedValue([]) // No events missing details
      // Handler calls findFirst twice per track (main loop + cleanup), return null for no symptom
      findFirstEventSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
      expect(Array.isArray(json.data)).toBe(true)

      const trackNotification = json.data.find(
        (n: { type: string }) => n.type === 'symptomReminder'
      )
      expect(trackNotification).toBeDefined()
      expect(trackNotification.id).toBeDefined()
      expect(trackNotification.title).toBeDefined()
      expect(trackNotification.message).toBeDefined()
      expect(trackNotification.ctaLabel).toBeDefined()

      getSessionSpy.mockRestore()
      findManyTracksSpy.mockRestore()
      findFirstEventSpy.mockRestore()
      findManyDismissalsSpy.mockRestore()
      findManyEventsSpy.mockRestore()
    })

    it('respects dismissals and excludes dismissed notifications', async () => {
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: threeDaysAgo,
        title: 'Test Appointment',
        track: {
          slug: 'test-track',
          title: 'Test Track'
        }
      } as {
        id: string
        trackId: string
        date: Date
        title: string
        track: {
          slug: string
          title: string
        }
      }

      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const mockDismissal = {
        id: 'dismissal-1',
        userId: 'user-1',
        type: 'EVENT_MISSING_DETAILS' as const,
        entityId: 'event-1',
        dismissedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManyEventsSpy = jest.spyOn(prisma.event, 'findMany')
      const findManyDismissalsSpy = jest.spyOn(prisma.hubDismissal, 'findMany')
      const findManyTracksSpy = jest.spyOn(prisma.healthTrack, 'findMany')
      const findFirstEventSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findManyEventsSpy.mockResolvedValue([mockEvent as any])
      findManyDismissalsSpy.mockResolvedValue([mockDismissal])
      findManyTracksSpy.mockResolvedValue([mockTrack])
      // Handler calls findFirst twice per track (main loop + cleanup), return null for no recent symptom
      findFirstEventSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
      expect(Array.isArray(json.data)).toBe(true)

      const eventNotification = json.data.find(
        (n: { type: string }) => n.type === 'appointmentDetails'
      )
      expect(eventNotification).toBeUndefined()

      getSessionSpy.mockRestore()
      findManyEventsSpy.mockRestore()
      findManyDismissalsSpy.mockRestore()
      findManyTracksSpy.mockRestore()
      findFirstEventSpy.mockRestore()
    })

    it('does not return EventMissingDetails for event with note', async () => {
      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManyEventsSpy = jest.spyOn(prisma.event, 'findMany')
      const findManyDismissalsSpy = jest.spyOn(prisma.hubDismissal, 'findMany')
      const findManyTracksSpy = jest.spyOn(prisma.healthTrack, 'findMany')
      const findFirstEventSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findManyEventsSpy.mockResolvedValue([]) // Event has notes, so not returned
      findManyDismissalsSpy.mockResolvedValue([])
      findManyTracksSpy.mockResolvedValue([mockTrack])
      // Handler calls findFirst twice per track (main loop + cleanup), return null for no recent symptom
      findFirstEventSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()

      const eventNotification = json.data.find(
        (n: { type: string }) => n.type === 'appointmentDetails'
      )
      expect(eventNotification).toBeUndefined()

      getSessionSpy.mockRestore()
      findManyEventsSpy.mockRestore()
      findManyDismissalsSpy.mockRestore()
      findManyTracksSpy.mockRestore()
      findFirstEventSpy.mockRestore()
    })

    it('does not return EventMissingDetails for event with upload', async () => {
      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManyEventsSpy = jest.spyOn(prisma.event, 'findMany')
      const findManyDismissalsSpy = jest.spyOn(prisma.hubDismissal, 'findMany')
      const findManyTracksSpy = jest.spyOn(prisma.healthTrack, 'findMany')
      const findFirstEventSpy = jest.spyOn(prisma.event, 'findFirst')

      getSessionSpy.mockResolvedValue(mockSession)
      findManyEventsSpy.mockResolvedValue([]) // Event has upload, so not returned
      findManyDismissalsSpy.mockResolvedValue([])
      findManyTracksSpy.mockResolvedValue([mockTrack])
      // Handler calls findFirst twice per track (main loop + cleanup), return null for no recent symptom
      findFirstEventSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()

      const eventNotification = json.data.find(
        (n: { type: string }) => n.type === 'appointmentDetails'
      )
      expect(eventNotification).toBeUndefined()

      getSessionSpy.mockRestore()
      findManyEventsSpy.mockRestore()
      findManyDismissalsSpy.mockRestore()
      findManyTracksSpy.mockRestore()
      findFirstEventSpy.mockRestore()
    })

    it('does not return TrackMissingSymptom for track with recent symptom', async () => {
      const now = new Date()
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

      const mockTrack = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const mockSymptomEvent = {
        id: 'event-1',
        trackId: 'track-1',
        date: twoDaysAgo,
        type: 'SYMPTOM' as const,
        title: 'Symptom Log',
        notes: null,
        fileUrl: null,
        symptomType: 'pain',
        severity: 5,
        createdAt: twoDaysAgo,
        updatedAt: twoDaysAgo
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const findManyTracksSpy = jest.spyOn(prisma.healthTrack, 'findMany')
      const findFirstEventSpy = jest.spyOn(prisma.event, 'findFirst')
      const findManyDismissalsSpy = jest.spyOn(prisma.hubDismissal, 'findMany')
      const findManyEventsSpy = jest.spyOn(prisma.event, 'findMany')

      getSessionSpy.mockResolvedValue(mockSession)
      findManyTracksSpy.mockResolvedValue([mockTrack])
      findManyDismissalsSpy.mockResolvedValue([])
      findManyEventsSpy.mockResolvedValue([]) // No events missing details
      // Handler calls findFirst twice per track (main loop + cleanup), return symptom event for both
      findFirstEventSpy.mockResolvedValue(mockSymptomEvent)

      const res = await app.request('/api/users/user-1/hub/notifications')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()

      const trackNotification = json.data.find(
        (n: { type: string }) => n.type === 'symptomReminder'
      )
      expect(trackNotification).toBeUndefined()

      getSessionSpy.mockRestore()
      findManyTracksSpy.mockRestore()
      findFirstEventSpy.mockRestore()
      findManyDismissalsSpy.mockRestore()
      findManyEventsSpy.mockRestore()
    })
  })

  describe('POST /api/users/:userId/hub/notifications/dismiss', () => {
    it('returns 401 when user is not authenticated', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(null)

      const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'EVENT_MISSING_DETAILS', entityId: 'event-1' })
      })
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')

      getSessionSpy.mockRestore()
    })

    it('creates dismissal if missing (upsert)', async () => {
      const mockDismissal = {
        id: 'dismissal-1',
        userId: 'user-1',
        type: 'EVENT_MISSING_DETAILS' as const,
        entityId: 'event-1',
        dismissedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const upsertSpy = jest.spyOn(prisma.hubDismissal, 'upsert')

      getSessionSpy.mockResolvedValue(mockSession)
      upsertSpy.mockResolvedValue(mockDismissal)

      const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'EVENT_MISSING_DETAILS', entityId: 'event-1' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      expect(upsertSpy).toHaveBeenCalledWith({
        where: {
          // eslint-disable-next-line camelcase
          userId_type_entityId: {
            userId: 'user-1',
            type: 'EVENT_MISSING_DETAILS',
            entityId: 'event-1'
          }
        },
        update: {
          dismissedAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        create: {
          userId: 'user-1',
          type: 'EVENT_MISSING_DETAILS',
          entityId: 'event-1',
          dismissedAt: expect.any(Date)
        }
      })

      getSessionSpy.mockRestore()
      upsertSpy.mockRestore()
    })

    it('updates dismissal timestamp if exists', async () => {
      const existingDismissal = {
        id: 'dismissal-1',
        userId: 'user-1',
        type: 'EVENT_MISSING_DETAILS',
        entityId: 'event-1',
        dismissedAt: new Date('2024-01-01T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      const updatedDismissal = {
        ...existingDismissal,
        dismissedAt: new Date(),
        updatedAt: new Date(),
        type: 'EVENT_MISSING_DETAILS' as const
      }

      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      const upsertSpy = jest.spyOn(prisma.hubDismissal, 'upsert')

      getSessionSpy.mockResolvedValue(mockSession)
      upsertSpy.mockResolvedValue(updatedDismissal)

      const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'EVENT_MISSING_DETAILS', entityId: 'event-1' })
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)

      expect(upsertSpy).toHaveBeenCalled()

      getSessionSpy.mockRestore()
      upsertSpy.mockRestore()
    })

    it('rejects invalid type (400)', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(mockSession)

      const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INVALID_TYPE', entityId: 'event-1' })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBeDefined()

      getSessionSpy.mockRestore()
    })

    it('rejects missing entityId (400)', async () => {
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')
      getSessionSpy.mockResolvedValue(mockSession)

      const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'EVENT_MISSING_DETAILS' })
      })
      expect(res.status).toBe(400)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBeDefined()

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

      const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'EVENT_MISSING_DETAILS', entityId: 'event-1' })
      })
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })
  })
})
