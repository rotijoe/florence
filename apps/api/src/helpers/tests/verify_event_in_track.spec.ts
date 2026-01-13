import type { Prisma } from '@prisma/client'
import { EventType } from '@packages/types'
import { verifyEventInTrack } from '../verify_event_in_track.js'

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

    const mockTx = {
      event: {
        findFirst: jest.fn().mockResolvedValue(mockEvent)
      }
    } as unknown as Prisma.TransactionClient

    const result = await verifyEventInTrack(mockTx, 'test-slug', 'event-1')

    expect(result.event).toEqual(mockEvent)
    expect(result.trackExists).toBe(true)
    expect(mockTx.event.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'event-1',
        track: {
          slug: 'test-slug'
        }
      },
      select: expect.any(Object)
    })
  })

  it('returns null event and checks track when event does not exist but track exists', async () => {
    // When event is not found, verifyEventInTrack calls verifyTrackExists
    // which calls tx.healthTrack.findFirst
    const mockTx = {
      event: {
        findFirst: jest.fn().mockResolvedValue(null)
      },
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue({ id: 'track-1' })
      }
    } as unknown as Prisma.TransactionClient

    const result = await verifyEventInTrack(mockTx, 'test-slug', 'nonexistent-event')

    expect(result.event).toBeNull()
    expect(result.trackExists).toBe(true)
    expect(mockTx.healthTrack.findFirst).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
      select: { id: true }
    })
  })

  it('returns null event and false trackExists when track does not exist', async () => {
    const mockTx = {
      event: {
        findFirst: jest.fn().mockResolvedValue(null)
      },
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    } as unknown as Prisma.TransactionClient

    const result = await verifyEventInTrack(mockTx, 'nonexistent-slug', 'event-1')

    expect(result.event).toBeNull()
    expect(result.trackExists).toBe(false)
  })
})
