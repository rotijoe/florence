import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prismaRuntime, withUserRls } from '@packages/database'
import {
  EventType,
  type ApiResponse,
  type UpcomingAppointmentResponse,
  type UpcomingAppointmentsResponse
} from '@packages/types'
import { decryptEventContent } from '@/lib/crypto/index.js'

const DEFAULT_LIMIT = 5

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')

    const limitParam = c.req.query('limit')
    const limit = limitParam
      ? Math.max(1, Math.min(parseInt(limitParam, 10) || DEFAULT_LIMIT, 100))
      : DEFAULT_LIMIT

    const now = new Date()

    // Fetch limit+1 to check if there are more appointments
    const events = await withUserRls(prismaRuntime, userId, async (tx) => {
      return tx.event.findMany({
        where: {
          type: EventType.APPOINTMENT,
          date: { gt: now }
        },
        orderBy: { date: 'asc' },
        take: limit + 1,
        select: {
          id: true,
          date: true,
          track: { select: { slug: true } },
          content: {
            select: {
              contentEnc: true
            }
          }
        }
      })
    })

    // Determine if there are more appointments
    const hasMore = events.length > limit

    // Return only the requested limit
    const eventsToReturn = events.slice(0, limit)

    const appointments: UpcomingAppointmentResponse[] = eventsToReturn.map((event) => {
      let title = 'Untitled event'
      if (event.content?.contentEnc) {
        try {
          const content = decryptEventContent(event.content.contentEnc)
          title = content.title
        } catch (error) {
          console.error('Error decrypting event content:', error)
        }
      }

      return {
        eventId: event.id,
        trackSlug: event.track.slug,
        title,
        date: event.date.toISOString()
      }
    })

    const responseData: UpcomingAppointmentsResponse = {
      appointments,
      hasMore
    }

    const response: ApiResponse<UpcomingAppointmentsResponse> = {
      success: true,
      data: responseData
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
