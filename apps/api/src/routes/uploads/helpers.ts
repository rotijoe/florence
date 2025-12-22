import { z } from 'zod'
import type { Context } from 'hono'

export function badRequestFromZod(c: Context, error: z.ZodError): Response {
  return c.json(
    {
      success: false,
      error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    },
    400
  )
}
