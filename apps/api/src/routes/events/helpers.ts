import { z } from 'zod'
import type { Context } from 'hono'
import { EventType, type EventResponse } from '@packages/types'
import { prisma } from '@packages/database'
import { getPresignedDownloadUrl, getObjectKeyFromUrl } from '@/lib/s3.js'
import { EVENT_SELECT } from './constants.js'

type EventSelectResult = {
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
}

export async function formatEvent(event: EventSelectResult): Promise<EventResponse> {
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

  return {
    id: event.id,
    trackId: event.trackId,
    date: event.date.toISOString(),
    type: event.type as EventType,
    title: event.title,
    notes: event.notes,
    fileUrl,
    symptomType: event.symptomType,
    severity: event.severity,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }
}

export async function verifyTrackExists(
  userId: string,
  slug: string
): Promise<{ id: string } | null> {
  return await prisma.healthTrack.findFirst({
    where: { userId, slug },
    select: { id: true }
  })
}

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

export function badRequestFromZod(c: Context, error: z.ZodError): Response {
  return c.json(
    {
      success: false,
      error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    },
    400
  )
}
