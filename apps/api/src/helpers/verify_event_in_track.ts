import { prisma } from '@packages/database'
import { EVENT_SELECT } from '../routes/events/constants.js'
import type { EventSelectResult } from './format_event.js'
import { verifyTrackExists } from './verify_track_exists.js'

export async function verifyEventInTrack(
  userId: string,
  slug: string,
  eventId: string
): Promise<{
  event: EventSelectResult | null
  trackExists: boolean
}> {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      track: {
        userId,
        slug
      }
    },
    select: EVENT_SELECT
  })

  if (!event) {
    const trackExists = await verifyTrackExists(userId, slug)
    return { event: null, trackExists: !!trackExists }
  }

  return { event, trackExists: true }
}

