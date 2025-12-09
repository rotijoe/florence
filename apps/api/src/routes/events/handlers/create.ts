import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { verifyTrackExists, formatEvent, badRequestFromZod } from '../helpers.js'
import { createEventSchema } from '../validators.js'
import { EVENT_SELECT } from '../constants.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
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

    if (userId !== user.id) {
      return c.json(
        {
          success: false,
          error: 'Forbidden'
        },
        403
      )
    }

    const track = await verifyTrackExists(userId, slug)
    if (!track) {
      return c.json(
        {
          success: false,
          error: 'Track not found'
        },
        404
      )
    }

    const body = await c.req.json().catch(() => ({}))
    const parseResult = createEventSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const { title, type, date, notes, symptomType, severity } = parseResult.data

    const newEvent = await prisma.event.create({
      data: {
        trackId: track.id,
        title: title.trim(),
        type,
        date,
        notes,
        symptomType,
        severity
      },
      select: EVENT_SELECT
    })

    const formattedEvent = await formatEvent(newEvent)

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
}
