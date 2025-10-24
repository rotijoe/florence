import type { ApiResponse, TrackResponse, EventResponse } from '@packages/types'
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

app.get('/tracks/:slug/events', async (c) => {
  try {
    const slug = c.req.param('slug')
    const limitParam = c.req.query('limit')
    const limit = limitParam
      ? Math.max(1, Math.min(parseInt(limitParam, 10), 1000))
      : 100

    const track = await prisma.healthTrack.findFirst({
      where: { slug },
      select: { id: true }
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

    const events = await prisma.event.findMany({
      where: { trackId: track.id },
      orderBy: { date: 'desc' },
      take: limit,
      select: {
        id: true,
        trackId: true,
        date: true,
        type: true,
        title: true,
        description: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const formattedEvents: EventResponse[] = events.map((e) => ({
      id: e.id,
      trackId: e.trackId,
      date: e.date.toISOString(),
      type: e.type,
      title: e.title,
      description: e.description,
      fileUrl: e.fileUrl,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString()
    }))

    const response: ApiResponse<EventResponse[]> = {
      success: true,
      data: formattedEvents
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
