import type { Prisma } from '@prisma/client'
import { EVENT_SELECT } from '../routes/events/constants.js'
import type { EventSelectResult } from './format_event.js'
import { verifyTrackExists } from './verify_track_exists.js'

export async function verifyEventInTrack(
  tx: Prisma.TransactionClient,
  slug: string,
  eventId: string
): Promise<{
  event: EventSelectResult | null
  trackExists: boolean
}> {
  const event = await tx.event.findFirst({
    where: {
      id: eventId,
      track: {
        slug
      }
    },
    select: EVENT_SELECT
  })

  if (!event) {
    const trackExists = await verifyTrackExists(tx, slug)
    return { event: null, trackExists: !!trackExists }
  }

  return { event, trackExists: true }
}

