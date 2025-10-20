import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppVariables } from './types.js'
import { auth } from './auth.js'
import usersRoute from './routes/users/index.js'

const app = new Hono<{ Variables: AppVariables }>()

// CORS middleware for Better Auth
app.use(
  '/api/auth/*',
  cors({
    origin: 'http://localhost:3000', // Next.js frontend URL
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
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

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/hello/:name', (c) => {
  const name = c.req.param('name')
  return c.text(`Hello ${name}`)
})

app.route('/api', usersRoute)

const server = serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT || 8787)
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('\nShutting down server...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
