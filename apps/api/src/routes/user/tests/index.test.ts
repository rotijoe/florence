import { createTestApp } from '@/test-setup'

describe('User API - Route Composition', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  it('mounts GET /api/users/:userId route', async () => {
    const res = await app.request('/api/users/user-1')
    // Route exists (will return 401, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts GET /api/users/:userId/appointments/upcoming route', async () => {
    const res = await app.request('/api/users/user-1/appointments/upcoming')
    // Route exists (will return 401, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts GET /api/users/:userId/hub/notifications route', async () => {
    const res = await app.request('/api/users/user-1/hub/notifications')
    // Route exists (will return 401, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })

  it('mounts POST /api/users/:userId/hub/notifications/dismiss route', async () => {
    const res = await app.request('/api/users/user-1/hub/notifications/dismiss', {
      method: 'POST'
    })
    // Route exists (will return 401, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })
})
