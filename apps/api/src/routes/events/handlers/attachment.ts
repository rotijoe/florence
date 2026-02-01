import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prismaRuntime, withUserRls } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { eventNotFoundResponse } from '../helpers.js'
import { trackNotFoundResponse, verifyEventInTrack, formatEvent } from '@/helpers/index.js'
import { getObjectKeyFromUrl, deleteFile } from '@/lib/s3/index.js'
import { EVENT_SELECT } from '../constants.js'
import { encryptEventContent, decryptEventContent } from '@/lib/crypto/index.js'

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

    // Decrypt content to get fileUrl
    let fileUrl: string | null = null
    if (existingEvent.content?.contentEnc) {
      try {
        const content = decryptEventContent(existingEvent.content.contentEnc)
        fileUrl = content.fileUrl
      } catch (error) {
        console.error('Error decrypting content:', error)
      }
    }

    if (!fileUrl) {
      return c.json(
        {
          success: false,
          error: 'Event has no attachment to delete'
        },
        400
      )
    }

    const key = getObjectKeyFromUrl(fileUrl)
    if (!key) {
      return c.json(
        {
          success: false,
          error: 'Invalid file URL'
        },
        400
      )
    }

    await deleteFile(key)

    const updatedEvent = await withUserRls(prismaRuntime, userId, async (tx) => {
      // Get existing content to update
      const existingContent = await tx.event.findUnique({
        where: { id: eventId },
        select: { content: { select: { contentEnc: true } } }
      })

      // Decrypt existing content or use defaults
      let contentPayload = {
        title: 'Untitled event',
        notes: null as string | null,
        fileUrl: null as string | null,
        symptomType: null as string | null,
        severity: null as number | null
      }

      if (existingContent?.content?.contentEnc) {
        try {
          contentPayload = decryptEventContent(existingContent.content.contentEnc)
        } catch (error) {
          console.error('Error decrypting existing content:', error)
        }
      }

      // Remove fileUrl
      contentPayload.fileUrl = null

      // Encrypt updated content
      const contentEnc = encryptEventContent(contentPayload)

      await tx.eventContent.upsert({
        where: {
          eventId
        },
        create: {
          eventId,
          contentEnc: new Uint8Array(contentEnc)
        },
        update: {
          contentEnc: new Uint8Array(contentEnc)
        }
      })

      return tx.event.update({
        where: {
          id: eventId
        },
        data: {
          updatedAt: new Date()
        },
        select: EVENT_SELECT
      })
    })

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
