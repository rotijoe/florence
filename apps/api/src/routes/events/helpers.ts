import { z } from 'zod'
import type { Context } from 'hono'
import type { AppVariables } from '../../types/index.js'

export function badRequestFromZod(c: Context, error: z.ZodError): Response {
  return c.json(
    {
      success: false,
      error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    },
    400
  )
}

export function eventNotFoundResponse(c: Context<{ Variables: AppVariables }>): Response {
  return c.json(
    {
      success: false,
      error: 'Event not found'
    },
    404
  )
}
