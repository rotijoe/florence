import type { ApiResponse, TrackResponse } from '@packages/types'
import type { AppVariables } from '../../types.js'
import { Hono } from 'hono'
import { prisma } from '@packages/database'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/tracks/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')

    const track = await prisma.healthTrack.findFirst({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true
      }
    })

    if (!track) {
      return c.json(
        {
          success: false,
          error: 'Track not found'
        },
        404
      )
    }

    const response: ApiResponse<TrackResponse> = {
      success: true,
      data: {
        id: track.id,
        name: track.title,
        slug: track.slug,
        createdAt: track.createdAt.toISOString()
      }
    }

    return c.json(response)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return c.json(
      {
        success: false,
        error: errorMessage
      },
      500
    )
  }
})

export default app
