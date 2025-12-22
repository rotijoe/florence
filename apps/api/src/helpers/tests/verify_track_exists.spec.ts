import { verifyTrackExists } from '../verify_track_exists.js'
import { prisma } from '@packages/database'

describe('verifyTrackExists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns track when it exists', async () => {
    const mockTrack = { id: 'track-1' }
    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy.mockResolvedValue(
      mockTrack as unknown as Awaited<ReturnType<typeof prisma.healthTrack.findFirst>>
    )

    const result = await verifyTrackExists('user-1', 'test-slug')

    expect(result).toEqual(mockTrack)
    expect(findFirstSpy).toHaveBeenCalledWith({
      where: { userId: 'user-1', slug: 'test-slug' },
      select: { id: true }
    })

    findFirstSpy.mockRestore()
  })

  it('returns null when track does not exist', async () => {
    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy.mockResolvedValue(null)

    const result = await verifyTrackExists('user-1', 'nonexistent-slug')

    expect(result).toBeNull()

    findFirstSpy.mockRestore()
  })
})

