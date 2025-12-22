import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import { z } from 'zod'
import { EventType, type ApiResponse } from '@packages/types'

const dismissSchema = z.object({
  type: z.enum(['EVENT_MISSING_DETAILS', 'TRACK_MISSING_SYMPTOM']),
  entityId: z.string().min(1)
})

export async function getHubNotifications(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch dismissals for this user
    const dismissals = await prisma.hubDismissal.findMany({
      where: {
        userId
      },
      select: {
        type: true,
        entityId: true
      }
    })

    const dismissedSet = new Set(dismissals.map((d) => `${d.type}:${d.entityId}`))

    const notifications: Array<{
      id: string
      type: 'appointmentDetails' | 'symptomReminder'
      title: string
      message: string
      ctaLabel: string
      href?: string
      entityId: string
      notificationType: 'EVENT_MISSING_DETAILS' | 'TRACK_MISSING_SYMPTOM'
      trackSlug?: string
    }> = []

    // Find events missing details (past 7 days, no note, no upload)
    const eventsMissingDetails = await prisma.event.findMany({
      where: {
        track: {
          userId
        },
        date: {
          gte: sevenDaysAgo,
          lt: now
        },
        AND: [
          {
            OR: [{ notes: null }, { notes: '' }]
          },
          { fileUrl: null }
        ]
      },
      select: {
        id: true,
        trackId: true,
        date: true,
        title: true,
        track: {
          select: {
            slug: true,
            title: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    for (const event of eventsMissingDetails) {
      const dismissalKey = `EVENT_MISSING_DETAILS:${event.id}`
      if (!dismissedSet.has(dismissalKey)) {
        notifications.push({
          id: `event-missing-details-${event.id}`,
          type: 'appointmentDetails',
          title: `Add details to "${event.title}"`,
          message: `Capture key points from this event in your ${event.track.title} track while they are still fresh.`,
          ctaLabel: 'Add details',
          href: `/${userId}/tracks/${event.track.slug}/${event.id}`,
          entityId: event.id,
          notificationType: 'EVENT_MISSING_DETAILS'
        })
      }
    }

    // Find tracks missing symptoms (no symptom logged in last 7 days)
    const tracks = await prisma.healthTrack.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    })

    for (const track of tracks) {
      const dismissalKey = `TRACK_MISSING_SYMPTOM:${track.id}`
      if (dismissedSet.has(dismissalKey)) {
        continue
      }

      // Find most recent symptom event for this track
      const lastSymptomEvent = await prisma.event.findFirst({
        where: {
          trackId: track.id,
          type: EventType.SYMPTOM
        },
        orderBy: {
          date: 'desc'
        },
        select: {
          date: true
        }
      })

      const hasRecentSymptom = lastSymptomEvent && lastSymptomEvent.date >= sevenDaysAgo

      if (!hasRecentSymptom) {
        notifications.push({
          id: `track-missing-symptom-${track.id}`,
          type: 'symptomReminder',
          title: `Log a symptom in ${track.title}`,
          message: `A quick check‑in helps you and your care team see patterns over time.`,
          ctaLabel: 'Log symptom',
          entityId: track.id,
          notificationType: 'TRACK_MISSING_SYMPTOM',
          trackSlug: track.slug
        })
      }
    }

    // Lazy cleanup: remove dismissals for entities that are no longer eligible
    const eligibleEntityIds = new Set<string>()
    eventsMissingDetails.forEach((e) => {
      eligibleEntityIds.add(`EVENT_MISSING_DETAILS:${e.id}`)
    })
    for (const track of tracks) {
      const lastSymptomEvent = await prisma.event.findFirst({
        where: {
          trackId: track.id,
          type: EventType.SYMPTOM
        },
        orderBy: {
          date: 'desc'
        },
        select: {
          date: true
        }
      })
      const hasRecentSymptom = lastSymptomEvent && lastSymptomEvent.date >= sevenDaysAgo
      if (!hasRecentSymptom) {
        eligibleEntityIds.add(`TRACK_MISSING_SYMPTOM:${track.id}`)
      }
    }

    // Delete dismissals for entities that are no longer eligible
    const dismissalsToDelete = dismissals.filter(
      (d) => !eligibleEntityIds.has(`${d.type}:${d.entityId}`)
    )

    if (dismissalsToDelete.length > 0) {
      await prisma.hubDismissal.deleteMany({
        where: {
          userId,
          OR: dismissalsToDelete.map((d) => ({
            type: d.type,
            entityId: d.entityId
          }))
        }
      })
    }

    const response: ApiResponse<typeof notifications> = {
      success: true,
      data: notifications
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

export async function dismissHubNotification(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')

    const body = await c.req.json().catch(() => ({}))
    const parseResult = dismissSchema.safeParse(body)

    if (!parseResult.success) {
      return c.json(
        {
          success: false,
          error: parseResult.error.errors.map((e) => e.message).join(', ')
        },
        400
      )
    }

    const { type, entityId } = parseResult.data

    const dismissedAt = new Date()

    await prisma.hubDismissal.upsert({
      where: {
        // eslint-disable-next-line camelcase
        userId_type_entityId: {
          userId,
          type,
          entityId
        }
      },
      update: {
        dismissedAt,
        updatedAt: dismissedAt
      },
      create: {
        userId,
        type,
        entityId,
        dismissedAt
      }
    })

    const response: ApiResponse<{ ok: true }> = {
      success: true,
      data: { ok: true }
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
