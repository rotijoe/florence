import { Hono } from 'hono'
import type { AppVariables } from './types.js'
import { mockAuth, mockPrisma } from './test-helpers'

export function createTestApp() {
  const app = new Hono<{ Variables: AppVariables }>()

  // Session middleware - extracts user and session from Better Auth
  app.use('*', async (c, next) => {
    try {
      const session = await mockAuth.api.getSession({
        headers: c.req.raw.headers
      })

      if (!session) {
        c.set('user', null)
        c.set('session', null)
        return next()
      }

      c.set('user', session.user)
      c.set('session', session.session)
      return next()
    } catch (error) {
      // Handle authentication service errors
      c.set('user', null)
      c.set('session', null)
      return next()
    }
  })

  // Better Auth handler
  app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return mockAuth.handler(c.req.raw)
  })

  app.get('/', (c) => {
    return c.text('Hello Hono!')
  })

  app.get('/hello/:name', (c) => {
    const name = c.req.param('name')
    return c.text(`Hello ${name}`)
  })

  // Add route handlers directly to avoid module resolution issues
  app.get('/api/tracks/:slug', async (c) => {
    try {
      const slug = c.req.param('slug')

      const track = await mockPrisma.healthTrack.findFirst({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true
        }
      })

      if (!track) {
        return c.json(
          {
            success: false,
            error: 'Track not found'
          },
          404
        )
      }

      const response = {
        success: true,
        data: {
          id: track.id,
          name: track.title,
          slug: track.slug,
          createdAt: track.createdAt.toISOString()
        }
      }

      return c.json(response)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return c.json(
        {
          success: false,
          error: errorMessage
        },
        500
      )
    }
  })

  app.get('/api/tracks/:slug/events', async (c) => {
    try {
      const slug = c.req.param('slug')
      const limitParam = c.req.query('limit')
      const limit = limitParam
        ? Math.max(1, Math.min(parseInt(limitParam, 10), 1000))
        : 100

      const track = await mockPrisma.healthTrack.findFirst({
        where: { slug },
        select: { id: true }
      })

      if (!track) {
        return c.json(
          {
            success: false,
            error: 'Track not found'
          },
          404
        )
      }

      const events = await mockPrisma.event.findMany({
        where: { trackId: track.id },
        orderBy: { date: 'desc' },
        take: limit,
        select: {
          id: true,
          trackId: true,
          date: true,
          type: true,
          title: true,
          description: true,
          fileUrl: true,
          createdAt: true,
          updatedAt: true
        }
      })

      const formattedEvents = events.map((e: any) => ({
        id: e.id,
        trackId: e.trackId,
        date: e.date.toISOString(),
        type: e.type,
        title: e.title,
        description: e.description,
        fileUrl: e.fileUrl,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      }))

      const response = {
        success: true,
        data: formattedEvents
      }

      return c.json(response)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return c.json(
        {
          success: false,
          error: errorMessage
        },
        500
      )
    }
  })

  app.get('/api/user/me', async (c) => {
    try {
      // Get the current user from context (set by session middleware)
      const currentUser = c.get('user')

      // Require authentication
      if (!currentUser) {
        return c.json(
          {
            success: false,
            error: 'Unauthorized'
          },
          401
        )
      }

      // Fetch user from database with their health tracks
      const user = await mockPrisma.user.findUnique({
        where: {
          id: currentUser.id
        },
        select: {
          id: true,
          name: true,
          email: true,
          tracks: {
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
              updatedAt: true,
              userId: true,
              slug: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      if (!user) {
        return c.json(
          {
            success: false,
            error: 'User not found'
          },
          404
        )
      }

      const response = {
        success: true,
        data: user
      }

      return c.json(response)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return c.json(
        {
          success: false,
          error: errorMessage
        },
        500
      )
    }
  })

  return app
}
