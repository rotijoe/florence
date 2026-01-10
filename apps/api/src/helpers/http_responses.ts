import type { Context } from 'hono'
import type { AppVariables } from '@/types/index.js'

export function trackNotFoundResponse(c: Context<{ Variables: AppVariables }>): Response {
  return c.json(
    {
      success: false,
      error: 'Track not found'
    },
    404
  )
}

