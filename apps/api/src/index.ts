import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'

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
