import { prisma, EventType } from '@packages/database'

describe('Tracks API', () => {
  let testTrack: { id: string; slug: string; userId: string }

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test-tracks@example.com',
        name: 'Test User'
      }
    })

    const track = await prisma.healthTrack.create({
      data: {
        userId: user.id,
        title: 'Test Track',
        slug: 'test-track',
        description: 'A test track for testing'
      }
    })

    testTrack = { id: track.id, slug: track.slug, userId: user.id }

    await prisma.event.createMany({
      data: [
        {
          trackId: track.id,
          date: new Date(),
          title: 'Event 1',
          type: EventType.NOTE,
          description: 'Most recent'
        },
        {
          trackId: track.id,
          date: new Date(Date.now() - 86400000),
          title: 'Event 2',
          type: EventType.RESULT,
          description: 'One day ago'
        },
        {
          trackId: track.id,
          date: new Date(Date.now() - 2 * 86400000),
          title: 'Event 3',
          type: EventType.FEELING,
          description: 'Two days ago'
        }
      ]
    })
  })

  afterAll(async () => {
    await prisma.event.deleteMany({
      where: { trackId: testTrack.id }
    })
    await prisma.healthTrack.deleteMany({
      where: { slug: 'test-track' }
    })
    await prisma.user.deleteMany({
      where: { id: testTrack.userId }
    })
  })

  describe('GET /api/tracks/:slug', () => {
    it('returns 200 and track for valid slug', async () => {
      const res = await fetch(
        `http://localhost:8787/api/tracks/${testTrack.slug}`
      )
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveProperty('id', testTrack.id)
      expect(json.data).toHaveProperty('slug', testTrack.slug)
      expect(json.data).toHaveProperty('name', 'Test Track')
      expect(json.data).toHaveProperty('createdAt')
    })

    it('returns 404 for missing slug', async () => {
      const res = await fetch(
        'http://localhost:8787/api/tracks/nonexistent-slug'
      )
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')
    })
  })

  describe('GET /api/tracks/:slug/events', () => {
    it('returns events in desc order', async () => {
      const res = await fetch(
        `http://localhost:8787/api/tracks/${testTrack.slug}/events`
      )
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBe(true)
      expect(json.data.length).toBe(3)

      expect(json.data[0].title).toBe('Event 1')
      expect(json.data[1].title).toBe('Event 2')
      expect(json.data[2].title).toBe('Event 3')
    })

    it('respects limit parameter', async () => {
      const res = await fetch(
        `http://localhost:8787/api/tracks/${testTrack.slug}/events?limit=2`
      )
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.length).toBe(2)
      expect(json.data[0].title).toBe('Event 1')
      expect(json.data[1].title).toBe('Event 2')
    })

    it('returns 404 for missing slug', async () => {
      const res = await fetch(
        'http://localhost:8787/api/tracks/nonexistent-slug/events'
      )
      expect(res.status).toBe(404)

      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Track not found')
    })
  })
})
