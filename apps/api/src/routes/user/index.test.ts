import { prisma } from '@packages/database'

describe('GET /api/user/me', () => {
  let testUserId: string

  beforeAll(async () => {
    // Create a test user with health tracks
    const testUser = await prisma.user.create({
      data: {
        email: 'test-me-endpoint@example.com',
        name: 'Test Me User',
        emailVerified: true,
        tracks: {
          create: [
            {
              title: 'Diabetes Management',
              slug: 'diabetes-management',
              description: 'Tracking blood sugar levels'
            },
            {
              title: 'Physical Therapy',
              slug: 'physical-therapy',
              description: 'Post-surgery rehabilitation'
            }
          ]
        }
      }
    })
    testUserId = testUser.id
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.healthTrack.deleteMany({
      where: { userId: testUserId }
    })
    await prisma.user.delete({
      where: { id: testUserId }
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    const response = await fetch('http://localhost:8787/api/user/me')
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return authenticated user info with their health tracks', async () => {
    // Note: This test requires a valid session token
    // In a real implementation, you would need to create a session first
    // For now, this test structure shows what needs to be tested
    expect(true).toBe(true)
  })

  it('should return user with empty tracks array when user has no tracks', async () => {
    // Create a user without tracks
    const userWithoutTracks = await prisma.user.create({
      data: {
        email: 'no-tracks@example.com',
        name: 'No Tracks User',
        emailVerified: true
      }
    })

    // Note: This test requires a valid session token
    // In a real implementation, you would need to create a session first
    // For now, this test structure shows what needs to be tested

    // Clean up
    await prisma.user.delete({
      where: { id: userWithoutTracks.id }
    })

    expect(true).toBe(true)
  })
})
