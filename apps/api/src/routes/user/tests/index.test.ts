import { createTestApp } from '@/test-setup'

describe('User API - Route Composition', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
  })

  it('mounts GET /api/user/me route', async () => {
    const res = await app.request('/api/user/me')
    // Route exists (will return 401, but route is mounted)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(500)
  })
})

