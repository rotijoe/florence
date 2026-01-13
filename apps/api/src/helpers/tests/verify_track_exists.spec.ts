import { verifyTrackExists } from '../verify_track_exists.js'
import type { Prisma } from '@prisma/client'

describe('verifyTrackExists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns track when it exists', async () => {
    const mockTrack = { id: 'track-1' }
    const mockTx = {
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue(mockTrack)
      }
    } as unknown as Prisma.TransactionClient

    const result = await verifyTrackExists(mockTx, 'test-slug')

    expect(result).toEqual(mockTrack)
    expect(mockTx.healthTrack.findFirst).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
      select: { id: true }
    })
  })

  it('returns null when track does not exist', async () => {
    const mockTx = {
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    } as unknown as Prisma.TransactionClient

    const result = await verifyTrackExists(mockTx, 'nonexistent-slug')

    expect(result).toBeNull()
  })
})

