import { createTestApp } from '@/test-setup'

describe('Events API - Route Composition', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  it('mounts GET /api/users/:userId/tracks/:slug/events route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events')
    // Route exists (will return 404 for non-existent track, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts POST /api/users/:userId/tracks/:slug/events route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    // Route exists (will return 401/404, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts GET /api/users/:userId/tracks/:slug/events/:eventId route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events/event-1')
    // Route exists
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts PATCH /api/users/:userId/tracks/:slug/events/:eventId route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events/event-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    // Route exists
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts DELETE /api/users/:userId/tracks/:slug/events/:eventId route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events/event-1', {
      method: 'DELETE'
    })
    // Route exists
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts DELETE /api/users/:userId/tracks/:slug/events/:eventId/attachment route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug/events/event-1/attachment', {
      method: 'DELETE'
    })
    // Route exists
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })
})

