import type { Context } from 'hono'
import type { AppVariables } from '@/types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import {
  trackNotFoundResponse,
  verifyTrackExists,
  formatEvent,
  type EventSelectResult
} from '@/helpers/index.js'
import { listEventsQuerySchema } from '../validators.js'
import { EVENT_SELECT } from '../constants.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')

    const queryResult = listEventsQuerySchema.safeParse({
      limit: c.req.query('limit')
    })

    if (!queryResult.success) {
      return c.json(
        {
          success: false,
          error: queryResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        400
      )
    }

    const limit = queryResult.data.limit

    const events = await prisma.event.findMany({
      where: {
        track: {
          userId,
          slug
        }
      },
      orderBy: { date: 'desc' },
      take: limit,
      select: EVENT_SELECT
    })

    if (events.length === 0) {
      const trackExists = await verifyTrackExists(userId, slug)
      if (!trackExists) {
        return trackNotFoundResponse(c)
      }
    }

    const formattedEvents: EventResponse[] = await Promise.all(
      events.map((event: EventSelectResult) => formatEvent(event))
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
}
