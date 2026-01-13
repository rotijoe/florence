import { generateUniqueSlug } from '../generate_unique_slug'
import type { Prisma } from '@prisma/client'

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return base slug when no existing track found', async () => {
    const mockTx = {
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    } as unknown as Prisma.TransactionClient

    const slug = await generateUniqueSlug(mockTx, 'Sleep')

    expect(slug).toBe('sleep')
    expect(mockTx.healthTrack.findFirst).toHaveBeenCalledTimes(1)
    expect(mockTx.healthTrack.findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'sleep'
      }
    })
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

    const mockTx = {
      healthTrack: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(existingTrack) // First call finds existing
          .mockResolvedValueOnce(null) // Second call finds nothing
      }
    } as unknown as Prisma.TransactionClient

    const slug = await generateUniqueSlug(mockTx, 'Sleep')

    expect(slug).toBe('sleep-2')
    expect(mockTx.healthTrack.findFirst).toHaveBeenCalledTimes(2)
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

    const mockTx = {
      healthTrack: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(existingTrack1) // 'sleep' exists
          .mockResolvedValueOnce(existingTrack2) // 'sleep-2' exists
          .mockResolvedValueOnce(null) // 'sleep-3' is available
      }
    } as unknown as Prisma.TransactionClient

    const slug = await generateUniqueSlug(mockTx, 'Sleep')

    expect(slug).toBe('sleep-3')
    expect(mockTx.healthTrack.findFirst).toHaveBeenCalledTimes(3)
  })

  it('should handle titles with special characters', async () => {
    const mockTx = {
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    } as unknown as Prisma.TransactionClient

    const slug = await generateUniqueSlug(mockTx, 'Sleep & Hydration!')

    expect(slug).toBe('sleep-hydration')
  })

  it('should handle titles with multiple spaces', async () => {
    const mockTx = {
      healthTrack: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    } as unknown as Prisma.TransactionClient

    const slug = await generateUniqueSlug(mockTx, 'Sleep   Tracking')

    expect(slug).toBe('sleep-tracking')
  })
})
