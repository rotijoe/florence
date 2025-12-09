import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { verifyEventInTrack, formatEvent } from '../helpers.js'
import { getObjectKeyFromUrl, deleteFile } from '@/lib/s3.js'
import { EVENT_SELECT } from '../constants.js'

export async function remove(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const { event: existingEvent, trackExists } = await verifyEventInTrack(userId, slug, eventId)

    if (!trackExists) {
      return c.json(
        {
          success: false,
          error: 'Track not found'
        },
        404
      )
    }

    if (!existingEvent) {
      return c.json(
        {
          success: false,
          error: 'Event not found'
        },
        404
      )
    }

    if (!existingEvent.fileUrl) {
      return c.json(
        {
          success: false,
          error: 'Event has no attachment to delete'
        },
        400
      )
    }

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

    await deleteFile(key)

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: {
        fileUrl: null,
        updatedAt: new Date()
      },
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
