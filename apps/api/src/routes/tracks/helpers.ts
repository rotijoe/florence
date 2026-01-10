import { z } from 'zod'
import type { Context } from 'hono'
import type { TrackResponse } from '@packages/types'

type TrackFullSelectResult = {
  id: string
  userId: string
  title: string
  slug: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export function formatTrack(track: TrackFullSelectResult): TrackResponse {
  return {
    id: track.id,
    userId: track.userId,
    title: track.title,
    slug: track.slug,
    description: track.description,
    createdAt: track.createdAt.toISOString(),
    updatedAt: track.updatedAt.toISOString()
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
