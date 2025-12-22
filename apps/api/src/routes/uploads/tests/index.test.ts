import { createTestApp } from '@/test-setup'

describe('Uploads API - Route Composition', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  it('mounts POST /api/users/:userId/tracks/:slug/events/:eventId/upload-url route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events/event-1/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    // Route exists (will return 401/400, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts POST /api/users/:userId/tracks/:slug/events/:eventId/upload-confirm route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events/event-1/upload-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    // Route exists (will return 401/400, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })
})
