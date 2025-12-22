import { badRequestFromZod } from '../helpers.js'
import { z } from 'zod'
import type { Context } from 'hono'

describe('badRequestFromZod', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('formats Zod errors correctly', () => {
    const schema = z.object({
      title: z.string().min(1),
      age: z.number().min(18)
    })

    const result = schema.safeParse({ title: '', age: 15 })

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

