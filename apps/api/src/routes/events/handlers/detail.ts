import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { badRequestFromZod, trackNotFoundResponse, eventNotFoundResponse } from '../helpers.js'
import { verifyEventInTrack, formatEvent } from '@/helpers/index.js'
import { updateEventSchema } from '../validators.js'
import { EVENT_SELECT } from '../constants.js'

export async function get(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const { event, trackExists } = await verifyEventInTrack(userId, slug, eventId)

    if (!trackExists) {
      return trackNotFoundResponse(c)
    }

    if (!event) {
      return eventNotFoundResponse(c)
    }

    const formattedEvent = await formatEvent(event)

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
}

export async function update(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const { event: existingEvent, trackExists } = await verifyEventInTrack(userId, slug, eventId)

    if (!trackExists) {
      return trackNotFoundResponse(c)
    }

    if (!existingEvent) {
      return eventNotFoundResponse(c)
    }

    const body = await c.req.json().catch(() => ({}))
    const parseResult = updateEventSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const updateData: {
      title?: string
      notes?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    if (parseResult.data.title !== undefined) {
      updateData.title = parseResult.data.title.trim()
    }

    if (parseResult.data.notes !== undefined) {
      updateData.notes = parseResult.data.notes === '' ? null : parseResult.data.notes
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: updateData,
      select: EVENT_SELECT
    })

    const formattedEvent = await formatEvent(updatedEvent)

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
}

export async function remove(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const { event: existingEvent, trackExists } = await verifyEventInTrack(userId, slug, eventId)

    if (!trackExists) {
      return trackNotFoundResponse(c)
    }

    if (!existingEvent) {
      return eventNotFoundResponse(c)
    }

    if (existingEvent.fileUrl) {
      const { getObjectKeyFromUrl, deleteFile } = await import('@/lib/s3/index.js')
      const key = getObjectKeyFromUrl(existingEvent.fileUrl)
      if (key) {
        try {
          await deleteFile(key)
        } catch (error) {
          console.error('Error deleting file from S3:', error)
        }
      }
    }

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
}
