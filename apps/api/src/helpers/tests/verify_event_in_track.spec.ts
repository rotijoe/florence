import { verifyEventInTrack } from '../verify_event_in_track.js'
import { prisma } from '@packages/database'
import { EventType } from '@packages/types'

describe('verifyEventInTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns event when it exists in track', async () => {
    const mockEvent = {
      id: 'event-1',
      trackId: 'track-1',
      date: new Date('2024-01-01T00:00:00Z'),
      type: EventType.NOTE,
      title: 'Test Event',
      notes: null,
      fileUrl: null,
      symptomType: null,
      severity: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    }

    const findFirstSpy = jest.spyOn(prisma.event, 'findFirst')
    findFirstSpy.mockResolvedValue(
      mockEvent as unknown as Awaited<ReturnType<typeof prisma.event.findFirst>>
    )

    const result = await verifyEventInTrack('user-1', 'test-slug', 'event-1')

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

    const result = await verifyEventInTrack('user-1', 'test-slug', 'nonexistent-event')

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

    const result = await verifyEventInTrack('user-1', 'nonexistent-slug', 'event-1')

    expect(result.event).toBeNull()
    expect(result.trackExists).toBe(false)

    eventFindFirstSpy.mockRestore()
    trackFindFirstSpy.mockRestore()
  })
})

