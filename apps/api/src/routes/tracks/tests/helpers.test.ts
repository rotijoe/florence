import { formatTrack, badRequestFromZod } from '../helpers.js'
import { z } from 'zod'
import type { Context } from 'hono'

describe('Tracks Helpers', () => {
  describe('formatTrack', () => {
    it('formats track correctly', () => {
      const track = {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: 'Test description',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z')
      }

      const result = formatTrack(track)

      expect(result).toEqual({
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      })
    })
  })

  describe('badRequestFromZod', () => {
    it('formats Zod errors correctly', () => {
      const schema = z.object({
        title: z.string().min(1)
      })

      const result = schema.safeParse({ title: '' })

      if (!result.success) {
        const mockContext = {
          json: jest.fn().mockReturnValue({ status: 400 })
        } as unknown as Context

        badRequestFromZod(mockContext, result.error)

        expect(mockContext.json).toHaveBeenCalledWith(
          {
            success: false,
            error: expect.stringContaining('title')
          },
          400
        )
      }
    })
  })
})
