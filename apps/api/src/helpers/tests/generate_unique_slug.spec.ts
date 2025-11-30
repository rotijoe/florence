import { generateUniqueSlug } from '../generate_unique_slug'
import { prisma } from '@packages/database'

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return base slug when no existing track found', async () => {
    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy.mockResolvedValue(null)

    const slug = await generateUniqueSlug('user-1', 'Sleep')

    expect(slug).toBe('sleep')
    expect(findFirstSpy).toHaveBeenCalledTimes(1)
    expect(findFirstSpy).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        slug: 'sleep'
      }
    })
    findFirstSpy.mockRestore()
  })

  it('should append numeric suffix when slug exists', async () => {
    const existingTrack = {
      id: 'track-1',
      userId: 'user-1',
      slug: 'sleep',
      title: 'Sleep',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy
      .mockResolvedValueOnce(existingTrack) // First call finds existing
      .mockResolvedValueOnce(null) // Second call finds nothing

    const slug = await generateUniqueSlug('user-1', 'Sleep')

    expect(slug).toBe('sleep-2')
    expect(findFirstSpy).toHaveBeenCalledTimes(2)
    findFirstSpy.mockRestore()
  })

  it('should increment counter until unique slug found', async () => {
    const existingTrack1 = {
      id: 'track-1',
      userId: 'user-1',
      slug: 'sleep',
      title: 'Sleep',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const existingTrack2 = {
      id: 'track-2',
      userId: 'user-1',
      slug: 'sleep-2',
      title: 'Sleep',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy
      .mockResolvedValueOnce(existingTrack1) // 'sleep' exists
      .mockResolvedValueOnce(existingTrack2) // 'sleep-2' exists
      .mockResolvedValueOnce(null) // 'sleep-3' is available

    const slug = await generateUniqueSlug('user-1', 'Sleep')

    expect(slug).toBe('sleep-3')
    expect(findFirstSpy).toHaveBeenCalledTimes(3)
    findFirstSpy.mockRestore()
  })

  it('should handle titles with special characters', async () => {
    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy.mockResolvedValue(null)

    const slug = await generateUniqueSlug('user-1', 'Sleep & Hydration!')

    expect(slug).toBe('sleep-hydration')
    findFirstSpy.mockRestore()
  })

  it('should handle titles with multiple spaces', async () => {
    const findFirstSpy = jest.spyOn(prisma.healthTrack, 'findFirst')
    findFirstSpy.mockResolvedValue(null)

    const slug = await generateUniqueSlug('user-1', 'Sleep   Tracking')

    expect(slug).toBe('sleep-tracking')
    findFirstSpy.mockRestore()
  })
})
