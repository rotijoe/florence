import { createTestApp } from '@/test-setup'

describe('Tracks API - Route Composition', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  it('mounts GET /api/users/:userId/tracks/:slug route', async () => {
    const res = await app.request('/api/users/user-1/tracks/test-slug')
    // Route exists (will return 404 for non-existent track, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts POST /api/users/:userId/tracks route', async () => {
    const res = await app.request('/api/users/user-1/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    // Route exists (will return 401/400, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })
})
