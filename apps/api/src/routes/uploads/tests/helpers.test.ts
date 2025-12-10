import { verifyEventAndTrack } from '../helpers.js'
import { prisma } from '@packages/database'

describe('Uploads Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyEventAndTrack', () => {
    it('returns event when it exists in track', async () => {
      const mockEvent = {
        id: 'event-1',
        trackId: 'track-1'
      }

      const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      findFirstSpy.mockResolvedValue(
        mockEvent as unknown as Awaited<ReturnType<typeof prisma.event.findFirst>>
      )

      const result = await verifyEventAndTrack('event-1', 'test-slug')

      expect(result.event).toEqual(mockEvent)
      expect(result.trackExists).toBe(true)

      findFirstSpy.mockRestore()
    })

    it('returns null event and checks track when event does not exist', async () => {
      const eventFindFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      eventFindFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue({ id: 'track-1' } as unknown as Awaited<
        ReturnType<typeof prisma.healthTrack.findFirst>
      >)

      const result = await verifyEventAndTrack('nonexistent-event', 'test-slug')

      expect(result.event).toBeNull()
      expect(result.trackExists).toBe(true)

      eventFindFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })

    it('returns null event and false trackExists when track does not exist', async () => {
      const eventFindFirstSpy = jest.spyOn(prisma.event, 'findFirst')
      const trackFindFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')

      eventFindFirstSpy.mockResolvedValue(null)
      trackFindFirstSpy.mockResolvedValue(null)

      const result = await verifyEventAndTrack('event-1', 'nonexistent-slug')

      expect(result.event).toBeNull()
      expect(result.trackExists).toBe(false)

      eventFindFirstSpy.mockRestore()
      trackFindFirstSpy.mockRestore()
    })
  })
})
