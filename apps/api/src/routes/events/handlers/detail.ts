import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prismaRuntime, withUserRls } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { badRequestFromZod, eventNotFoundResponse } from '../helpers.js'
import { trackNotFoundResponse, verifyEventInTrack, formatEvent } from '@/helpers/index.js'
import { updateEventSchema } from '../validators.js'
import { EVENT_SELECT } from '../constants.js'
import { encryptEventContent, decryptEventContent } from '@/lib/crypto/index.js'

export async function get(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const { event, trackExists } = await withUserRls(prismaRuntime, userId, async (tx) => {
      return verifyEventInTrack(tx, slug, eventId)
    })

    if (!trackExists) {
      return trackNotFoundResponse(c)
    }

    if (!event) {
      return eventNotFoundResponse(c)
    }

    const formattedEvent = await formatEvent(event)

    const response: ApiResponse<EventResponse> = {
      success: true,
      data: formattedEvent
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

export async function update(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const body = await c.req.json().catch(() => ({}))
    const parseResult = updateEventSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const updatedEvent = await withUserRls(prismaRuntime, userId, async (tx) => {
      const { event: existingEvent, trackExists } = await verifyEventInTrack(tx, slug, eventId)

      if (!trackExists || !existingEvent) {
        return null
      }

      // Decrypt existing content or use defaults
      let contentPayload = {
        title: 'Untitled event',
        notes: null as string | null,
        fileUrl: null as string | null,
        symptomType: null as string | null,
        severity: null as number | null
      }

      if (existingEvent.content?.contentEnc) {
        try {
          contentPayload = decryptEventContent(existingEvent.content.contentEnc)
        } catch (error) {
          console.error('Error decrypting existing content:', error)
          // Use defaults if decryption fails
        }
      }

      // Update fields from request
      if (parseResult.data.title !== undefined) {
        contentPayload.title = parseResult.data.title.trim()
      }

      if (parseResult.data.notes !== undefined) {
        contentPayload.notes = parseResult.data.notes === '' ? null : parseResult.data.notes
      }

      // Encrypt updated content
      const contentEnc = encryptEventContent(contentPayload)

      // Update or create EventContent
      return tx.event.update({
        where: {
          id: eventId
        },
        data: {
          updatedAt: new Date(),
          content: {
            upsert: {
              create: {
                contentEnc: new Uint8Array(contentEnc)
              },
              update: {
                contentEnc: new Uint8Array(contentEnc)
              }
            }
          }
        },
        select: EVENT_SELECT
      })
    })

    if (!updatedEvent) {
      const { trackExists } = await withUserRls(prismaRuntime, userId, async (tx) => {
        return verifyEventInTrack(tx, slug, eventId)
      })

      if (!trackExists) {
        return trackNotFoundResponse(c)
      }

      return eventNotFoundResponse(c)
    }

    const formattedEvent = await formatEvent(updatedEvent)

    const response: ApiResponse<EventResponse> = {
      success: true,
      data: formattedEvent
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

export async function remove(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const { event: existingEvent, trackExists } = await withUserRls(
      prismaRuntime,
      userId,
      async (tx) => {
        return verifyEventInTrack(tx, slug, eventId)
      }
    )

    if (!trackExists) {
      return trackNotFoundResponse(c)
    }

    if (!existingEvent) {
      return eventNotFoundResponse(c)
    }

    // Decrypt content to get fileUrl for S3 deletion
    if (existingEvent.content?.contentEnc) {
      try {
        const { decryptEventContent } = await import('@/lib/crypto/index.js')
        const content = decryptEventContent(existingEvent.content.contentEnc)
        if (content.fileUrl) {
          const { getObjectKeyFromUrl, deleteFile } = await import('@/lib/s3/index.js')
          const key = getObjectKeyFromUrl(content.fileUrl)
          if (key) {
            try {
              await deleteFile(key)
            } catch (error) {
              console.error('Error deleting file from S3:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error decrypting content for file deletion:', error)
      }
    }

    // EventContent will be deleted automatically via cascade
    await withUserRls(prismaRuntime, userId, async (tx) => {
      await tx.event.delete({
        where: {
          id: eventId
        }
      })
    })

    const response: ApiResponse<never> = {
      success: true
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
