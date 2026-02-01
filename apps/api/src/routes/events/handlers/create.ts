import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prismaRuntime, withUserRls } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { badRequestFromZod } from '../helpers.js'
import { trackNotFoundResponse, verifyTrackExists, formatEvent } from '@/helpers/index.js'
import { createEventSchema } from '../validators.js'
import { EVENT_SELECT } from '../constants.js'
import { encryptEventContent } from '@/lib/crypto/index.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    // Auth and ownership are enforced by userScopeGuard middleware
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')

    const body = await c.req.json().catch(() => ({}))
    const parseResult = createEventSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const { title, type, date, notes, symptomType, severity } = parseResult.data

    // Encrypt content payload
    const contentPayload = {
      title: title.trim(),
      notes: notes ?? null,
      fileUrl: null,
      symptomType: symptomType ?? null,
      severity: severity ?? null
    }
    const contentEnc = encryptEventContent(contentPayload)

    const newEvent = await withUserRls(prismaRuntime, userId, async (tx) => {
      const track = await verifyTrackExists(tx, slug)
      if (!track) {
        return null
      }

      return tx.event.create({
        data: {
          trackId: track.id,
          type,
          date,
          content: {
            create: {
              contentEnc: new Uint8Array(contentEnc)
            }
          }
        },
        select: EVENT_SELECT
      })
    })

    if (!newEvent) {
      return trackNotFoundResponse(c)
    }

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
