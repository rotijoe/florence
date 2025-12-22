import { trackNotFoundResponse } from '../helpers.js'
import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'

describe('trackNotFoundResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 404 with Track not found error', () => {
    const mockContext = {
      json: jest.fn().mockReturnValue({ status: 404 })
    } as unknown as Context<{ Variables: AppVariables }>

    const result = trackNotFoundResponse(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Track not found'
      },
      404
    )
    expect(result).toEqual({ status: 404 })
  })
})

