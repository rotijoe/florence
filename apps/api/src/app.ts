import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppVariables } from '@/types'
import { auth } from '@/auth'
import { userScopeGuard } from '@/middleware/user_scope_guard'
import userRoute from '@/routes/user/index'
import tracksRoute from '@/routes/tracks/index'
import eventsRoute from '@/routes/events/index'
import uploadsRoute from '@/routes/uploads/index'

export const app = new Hono<{ Variables: AppVariables }>()

// CORS middleware for all API routes
app.use(
  '/api/*',
  cors({
    origin: 'http://localhost:3000', // Next.js frontend URL
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true
  })
)

// Session middleware - extracts user and session from Better Auth
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }

  c.set('user', session.user)
  c.set('session', session.session)
  return next()
})

// User scope guard - enforces authentication and ownership for all user-scoped routes
app.use('/api/users/:userId/*', userScopeGuard)

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api', userRoute)
app.route('/api', tracksRoute)
app.route('/api', eventsRoute)
app.route('/api', uploadsRoute)
