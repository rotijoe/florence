import { EventType, type ApiResponse, type EventResponse } from '@packages/types'
import type { AppVariables } from '../../types.js'
import { Hono } from 'hono'
import { prisma } from '@packages/database'
import { getPresignedDownloadUrl, getObjectKeyFromUrl, deleteFile } from '@/lib/s3.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/users/:userId/tracks/:slug/events', async (c) => {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const limitParam = c.req.query('limit')
    const limit = limitParam ? Math.max(1, Math.min(parseInt(limitParam, 10), 1000)) : 100

    // Use a single query with join to get events and verify track exists
    const events = await prisma.event.findMany({
      where: {
        track: {
          userId,
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
        notes: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Check if track exists by looking for any events or by checking if we got results
    if (events.length === 0) {
      // Double-check if track exists but has no events
      const trackExists = await prisma.healthTrack.findFirst({
        where: { userId, slug },
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

    const formattedEvents: EventResponse[] = await Promise.all(
      events.map(async (e) => {
        let fileUrl = e.fileUrl
        if (fileUrl) {
          const key = getObjectKeyFromUrl(fileUrl)
          if (key) {
            try {
              fileUrl = await getPresignedDownloadUrl(key)
            } catch (error) {
              console.error('Error generating presigned URL:', error)
            }
          }
        }

        return {
          id: e.id,
          trackId: e.trackId,
          date: e.date.toISOString(),
          type: e.type as EventType,
          title: e.title,
          notes: e.notes,
          fileUrl,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString()
        }
      })
    )

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

app.post('/users/:userId/tracks/:slug/events', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        401
      )
    }

    const userId = c.req.param('userId')
    const slug = c.req.param('slug')

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return c.json(
        {
          success: false,
          error: 'Forbidden'
        },
        403
      )
    }

    // Verify track exists and belongs to user
    const track = await prisma.healthTrack.findFirst({
      where: {
        userId,
        slug
      },
      select: {
        id: true
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

    // Parse request body with defaults
    const body = await c.req.json().catch(() => ({}))
    const title = body.title ?? 'Untitled event'
    const type = body.type ?? EventType.NOTE
    const date = body.date ? new Date(body.date) : new Date()
    const notes = body.notes ?? null

    // Validate title if provided
    if (title !== undefined && (!title || typeof title !== 'string' || title.trim().length === 0)) {
      return c.json(
        {
          success: false,
          error: 'Title is required and must be a non-empty string'
        },
        400
      )
    }

    // Validate type if provided
    if (type !== undefined && !Object.values(EventType).includes(type)) {
      return c.json(
        {
          success: false,
          error: `Type must be one of: ${Object.values(EventType).join(', ')}`
        },
        400
      )
    }

    // Create event
    const newEvent = await prisma.event.create({
      data: {
        trackId: track.id,
        title: title.trim(),
        type,
        date,
        notes
      },
      select: {
        id: true,
        trackId: true,
        date: true,
        type: true,
        title: true,
        notes: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    let fileUrl = newEvent.fileUrl
    if (fileUrl) {
      const key = getObjectKeyFromUrl(fileUrl)
      if (key) {
        try {
          fileUrl = await getPresignedDownloadUrl(key)
        } catch (error) {
          console.error('Error generating presigned URL:', error)
        }
      }
    }

    const formattedEvent: EventResponse = {
      id: newEvent.id,
      trackId: newEvent.trackId,
      date: newEvent.date.toISOString(),
      type: newEvent.type as EventType,
      title: newEvent.title,
      notes: newEvent.notes,
      fileUrl,
      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString()
    }

    const response: ApiResponse<EventResponse> = {
      success: true,
      data: formattedEvent
    }

    return c.json(response, 201)
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

app.get('/users/:userId/tracks/:slug/events/:eventId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    // Find the event and verify it belongs to the track
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        track: {
          userId,
          slug: slug
        }
      },
      select: {
        id: true,
        trackId: true,
        date: true,
        type: true,
        title: true,
        notes: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!event) {
      // Check if track exists
      const trackExists = await prisma.healthTrack.findFirst({
        where: { userId, slug },
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

    let fileUrl = event.fileUrl
    if (fileUrl) {
      const key = getObjectKeyFromUrl(fileUrl)
      if (key) {
        try {
          fileUrl = await getPresignedDownloadUrl(key)
        } catch (error) {
          console.error('Error generating presigned URL:', error)
        }
      }
    }

    const formattedEvent: EventResponse = {
      id: event.id,
      trackId: event.trackId,
      date: event.date.toISOString(),
      type: event.type as EventType,
      title: event.title,
      notes: event.notes,
      fileUrl,
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

app.patch('/users/:userId/tracks/:slug/events/:eventId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    // Verify event exists and belongs to track
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        track: {
          userId,
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
        where: { userId, slug },
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
    const { title, notes } = body

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

    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return c.json(
        {
          success: false,
          error: 'Notes must be a string or null'
        },
        400
      )
    }

    // Build update payload with only provided fields
    const updateData: {
      title?: string
      notes?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    if (title !== undefined) {
      updateData.title = title.trim()
    }

    if (notes !== undefined) {
      updateData.notes = notes === '' ? null : notes
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
        notes: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    let fileUrl = updatedEvent.fileUrl
    if (fileUrl) {
      const key = getObjectKeyFromUrl(fileUrl)
      if (key) {
        try {
          fileUrl = await getPresignedDownloadUrl(key)
        } catch (error) {
          console.error('Error generating presigned URL:', error)
        }
      }
    }

    const formattedEvent: EventResponse = {
      id: updatedEvent.id,
      trackId: updatedEvent.trackId,
      date: updatedEvent.date.toISOString(),
      type: updatedEvent.type as EventType,
      title: updatedEvent.title,
      notes: updatedEvent.notes,
      fileUrl,
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

app.delete('/users/:userId/tracks/:slug/events/:eventId/attachment', async (c) => {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    // Verify event exists and belongs to track
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        track: {
          userId,
          slug: slug
        }
      },
      select: {
        id: true,
        trackId: true,
        fileUrl: true
      }
    })

    if (!existingEvent) {
      // Check if track exists
      const trackExists = await prisma.healthTrack.findFirst({
        where: { userId, slug },
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

    // Check if event has an attachment
    if (!existingEvent.fileUrl) {
      return c.json(
        {
          success: false,
          error: 'Event has no attachment to delete'
        },
        400
      )
    }

    // Extract S3 key from fileUrl
    const key = getObjectKeyFromUrl(existingEvent.fileUrl)
    if (!key) {
      return c.json(
        {
          success: false,
          error: 'Invalid file URL'
        },
        400
      )
    }

    // Delete file from S3
    await deleteFile(key)

    // Update event to set fileUrl to null
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: {
        fileUrl: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        trackId: true,
        date: true,
        type: true,
        title: true,
        notes: true,
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
      notes: updatedEvent.notes,
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

app.delete('/users/:userId/tracks/:slug/events/:eventId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    // Verify event exists and belongs to track
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        track: {
          userId,
          slug: slug
        }
      },
      select: {
        id: true,
        trackId: true,
        fileUrl: true
      }
    })

    if (!existingEvent) {
      // Check if track exists
      const trackExists = await prisma.healthTrack.findFirst({
        where: { userId, slug },
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

    // If event has an attachment, delete it from S3
    if (existingEvent.fileUrl) {
      const key = getObjectKeyFromUrl(existingEvent.fileUrl)
      if (key) {
        try {
          await deleteFile(key)
        } catch (error) {
          console.error('Error deleting file from S3:', error)
          // Continue with event deletion even if S3 deletion fails
        }
      }
    }

    // Delete event from database
    await prisma.event.delete({
      where: {
        id: eventId
      }
    })

    const response: ApiResponse<never> = {
      success: true
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
