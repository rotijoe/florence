import { createTestApp } from '@/test-setup'
import { prisma } from '@packages/database'
import { auth } from '@/auth'
import { EventType } from '@packages/types'

describe('User API - Upcoming Appointments Handler', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/:userId/appointments/upcoming', () => {
    it('returns 401 when user is not authenticated', async () => {
      const res = await app.request('/api/users/user-1/appointments/upcoming')
      expect(res.status).toBe(401)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')
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

      const res = await app.request('/api/users/user-1/appointments/upcoming')
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Not found')

      getSessionSpy.mockRestore()
    })

    it('returns upcoming appointment events scoped to signed-in user (sorted soonest-first)', async () => {
      const now = new Date('2025-01-01T10:00:00.000Z')
      jest.useFakeTimers().setSystemTime(now)

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

      const findManySpy = jest.spyOn(prisma.event, 'findMany')
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockResolvedValue([
        {
          id: 'event-2',
          title: 'Sooner appt',
          date: new Date('2025-01-01T12:00:00.000Z'),
          track: { slug: 'sleep' }
        },
        {
          id: 'event-1',
          title: 'Later appt',
          date: new Date('2025-01-02T12:00:00.000Z'),
          track: { slug: 'pain' }
        }
      ] as unknown as Awaited<ReturnType<typeof prisma.event.findMany>>)

      const res = await app.request('/api/users/user-1/appointments/upcoming?limit=5')
      expect(res.status).toBe(200)

      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          type: EventType.APPOINTMENT,
          date: { gt: now },
          track: { userId: 'user-1' }
        },
        orderBy: { date: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          date: true,
          track: { select: { slug: true } }
        }
      })

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toEqual([
        {
          eventId: 'event-2',
          trackSlug: 'sleep',
          title: 'Sooner appt',
          date: '2025-01-01T12:00:00.000Z'
        },
        {
          eventId: 'event-1',
          trackSlug: 'pain',
          title: 'Later appt',
          date: '2025-01-02T12:00:00.000Z'
        }
      ])

      getSessionSpy.mockRestore()
      findManySpy.mockRestore()
      jest.useRealTimers()
    })

    it('applies a default limit when none is provided', async () => {
      const now = new Date('2025-01-01T10:00:00.000Z')
      jest.useFakeTimers().setSystemTime(now)

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

      const findManySpy = jest.spyOn(prisma.event, 'findMany')
      const getSessionSpy = jest.spyOn(auth.api, 'getSession')

      getSessionSpy.mockResolvedValue(mockSession)
      findManySpy.mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.event.findMany>>
      )

      const res = await app.request('/api/users/user-1/appointments/upcoming')
      expect(res.status).toBe(200)

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5
        })
      )

      getSessionSpy.mockRestore()
      findManySpy.mockRestore()
      jest.useRealTimers()
    })
  })
})
