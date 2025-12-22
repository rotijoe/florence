import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import { EventType, type ApiResponse, type UpcomingAppointmentResponse } from '@packages/types'

const DEFAULT_LIMIT = 5

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')

    const limitParam = c.req.query('limit')
    const limit = limitParam
      ? Math.max(1, Math.min(parseInt(limitParam, 10) || DEFAULT_LIMIT, 100))
      : DEFAULT_LIMIT

    const now = new Date()

    const events = await prisma.event.findMany({
      where: {
        type: EventType.APPOINTMENT,
        date: { gt: now },
        track: { userId }
      },
      orderBy: { date: 'asc' },
      take: limit,
      select: {
        id: true,
        title: true,
        date: true,
        track: { select: { slug: true } }
      }
    })

    const appointments: UpcomingAppointmentResponse[] = events.map((event) => ({
      eventId: event.id,
      trackSlug: event.track.slug,
      title: event.title,
      date: event.date.toISOString()
    }))

    const response: ApiResponse<UpcomingAppointmentResponse[]> = {
      success: true,
      data: appointments
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
