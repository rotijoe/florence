import { z } from 'zod'
import type { Context } from 'hono'
import { prisma } from '@packages/database'
import { formatEvent } from '../events/helpers.js'

export async function verifyEventAndTrack(
  eventId: string,
  slug: string
): Promise<{ event: { id: string; trackId: string } | null; trackExists: boolean }> {
  const event = await prisma.event.findFirst({
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

  if (!event) {
    const trackExists = await prisma.healthTrack.findFirst({
      where: { slug },
      select: { id: true }
    })

    return { event: null, trackExists: !!trackExists }
  }

  return { event, trackExists: true }
}

export async function formatEventResponse(event: {
  id: string
  trackId: string
  date: Date
  type: string
  title: string
  notes: string | null
  fileUrl: string | null
  symptomType: string | null
  severity: number | null
  createdAt: Date
  updatedAt: Date
}) {
  return await formatEvent(event)
}

export function badRequestFromZod(c: Context, error: z.ZodError): Response {
  return c.json(
    {
      success: false,
      error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    },
    400
  )
}
