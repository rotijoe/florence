import { z } from 'zod'
import type { Context } from 'hono'
import type { TrackResponse } from '@packages/types'

type TrackSelectResult = {
  id: string
  title: string
  slug: string
  createdAt: Date
}

export function formatTrack(track: TrackSelectResult): TrackResponse {
  return {
    id: track.id,
    name: track.title,
    slug: track.slug,
    createdAt: track.createdAt.toISOString()
  }
}

export function badRequestFromZod(c: Context, error: z.ZodError): Response {
  return c.json(
    {
      success: false,
      error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    },
    400
  )
}
