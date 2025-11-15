import type { ApiResponse, EventResponse, EventType } from '@packages/types'
import type { AppVariables } from '../../types.js'
import { Hono } from 'hono'
import { prisma } from '@packages/database'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/tracks/:slug/events', async (c) => {
  try {
    const slug = c.req.param('slug')
    const limitParam = c.req.query('limit')
    const limit = limitParam ? Math.max(1, Math.min(parseInt(limitParam, 10), 1000)) : 100

    // Use a single query with join to get events and verify track exists
    const events = await prisma.event.findMany({
      where: {
        track: {
          slug: slug
        }
      },
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

    // Check if track exists by looking for any events or by checking if we got results
    if (events.length === 0) {
      // Double-check if track exists but has no events
      const trackExists = await prisma.healthTrack.findFirst({
        where: { slug },
        select: { id: true }
      })

      if (!trackExists) {
        return c.json(
          {
            success: false,
            error: 'Track not found'
          },
          404
        )
      }
    }

    const formattedEvents: EventResponse[] = events.map((e) => ({
      id: e.id,
      trackId: e.trackId,
      date: e.date.toISOString(),
      type: e.type as EventType,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json(
      {
        success: false,
        error: errorMessage
      },
      500
    )
  }
})

app.get('/tracks/:slug/events/:eventId', async (c) => {
  try {
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    // Find the event and verify it belongs to the track
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        track: {
          slug: slug
        }
      },
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

    if (!event) {
      // Check if track exists
      const trackExists = await prisma.healthTrack.findFirst({
        where: { slug },
        select: { id: true }
      })

      if (!trackExists) {
        return c.json(
          {
            success: false,
            error: 'Track not found'
          },
          404
        )
      }

      return c.json(
        {
          success: false,
          error: 'Event not found'
        },
        404
      )
    }

    const formattedEvent: EventResponse = {
      id: event.id,
      trackId: event.trackId,
      date: event.date.toISOString(),
      type: event.type as EventType,
      title: event.title,
      description: event.description,
      fileUrl: event.fileUrl,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }

    const response: ApiResponse<EventResponse> = {
      success: true,
      data: formattedEvent
    }

    return c.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json(
      {
        success: false,
        error: errorMessage
      },
      500
    )
  }
})

app.patch('/tracks/:slug/events/:eventId', async (c) => {
  try {
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    // Verify event exists and belongs to track
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        track: {
          slug: slug
        }
      },
      select: {
        id: true,
        trackId: true
      }
    })

    if (!existingEvent) {
      // Check if track exists
      const trackExists = await prisma.healthTrack.findFirst({
        where: { slug },
        select: { id: true }
      })

      if (!trackExists) {
        return c.json(
          {
            success: false,
            error: 'Track not found'
          },
          404
        )
      }

      return c.json(
        {
          success: false,
          error: 'Event not found'
        },
        404
      )
    }

    // Parse request body
    const body = await c.req.json()
    const { title, description } = body

    // Validate required fields
    if (title !== undefined && (!title || typeof title !== 'string' || title.trim().length === 0)) {
      return c.json(
        {
          success: false,
          error: 'Title is required and must be a non-empty string'
        },
        400
      )
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return c.json(
        {
          success: false,
          error: 'Description must be a string or null'
        },
        400
      )
    }

    // Build update payload with only provided fields
    const updateData: {
      title?: string
      description?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    if (title !== undefined) {
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      updateData.description = description === '' ? null : description
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: updateData,
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

    const formattedEvent: EventResponse = {
      id: updatedEvent.id,
      trackId: updatedEvent.trackId,
      date: updatedEvent.date.toISOString(),
      type: updatedEvent.type as EventType,
      title: updatedEvent.title,
      description: updatedEvent.description,
      fileUrl: updatedEvent.fileUrl,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString()
    }

    const response: ApiResponse<EventResponse> = {
      success: true,
      data: formattedEvent
    }

    return c.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
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
