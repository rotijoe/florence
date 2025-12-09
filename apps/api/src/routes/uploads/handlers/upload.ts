import type { Context } from 'hono'
import type { AppVariables } from '@/types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, EventResponse } from '@packages/types'
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, getEventDocumentKey, getEventDocumentUrl, getStorageConfig } from '@/lib/s3.js'
import { verifyEventAndTrack, formatEventResponse, badRequestFromZod } from '../helpers.js'
import { uploadUrlSchema, uploadConfirmSchema } from '../validators.js'
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_CONTENT_TYPES,
  PRESIGNED_URL_EXPIRES_IN
} from '../constants.js'
import { EVENT_SELECT } from '../../events/constants.js'

export async function uploadUrl(c: Context<{ Variables: AppVariables }>) {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        401
      )
    }

    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const body = await c.req.json().catch(() => ({}))
    const parseResult = uploadUrlSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const { fileName, contentType } = parseResult.data

    const { event, trackExists } = await verifyEventAndTrack(eventId, slug)

    if (!trackExists) {
      return c.json(
        {
          success: false,
          error: 'Track not found'
        },
        404
      )
    }

    if (!event) {
      return c.json(
        {
          success: false,
          error: 'Event not found'
        },
        404
      )
    }

    const key = getEventDocumentKey(eventId, fileName)
    const config = getStorageConfig()

    const command = new PutObjectCommand({
      Bucket: config.s3BucketAppDocuments,
      Key: key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_URL_EXPIRES_IN })
    const fileUrl = getEventDocumentUrl(key)
    const expiresAt = new Date(Date.now() + PRESIGNED_URL_EXPIRES_IN * 1000).toISOString()

    const response: ApiResponse<{
      uploadUrl: string
      fileUrl: string
      key: string
      expiresAt: string
      maxSize: number
      allowedContentTypes: readonly string[]
    }> = {
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        key,
        expiresAt,
        maxSize: MAX_FILE_SIZE_BYTES,
        allowedContentTypes: ALLOWED_CONTENT_TYPES
      }
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

export async function uploadConfirm(c: Context<{ Variables: AppVariables }>) {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        401
      )
    }

    const slug = c.req.param('slug')
    const eventId = c.req.param('eventId')

    const body = await c.req.json().catch(() => ({}))
    const parseResult = uploadConfirmSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const { fileUrl, key } = parseResult.data

    const { event, trackExists } = await verifyEventAndTrack(eventId, slug)

    if (!trackExists) {
      return c.json(
        {
          success: false,
          error: 'Track not found'
        },
        404
      )
    }

    if (!event) {
      return c.json(
        {
          success: false,
          error: 'Event not found'
        },
        404
      )
    }

    const config = getStorageConfig()
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: config.s3BucketAppDocuments,
        Key: key
      })
      await s3Client.send(headCommand)
    } catch {
      return c.json(
        {
          success: false,
          error: 'File not found in storage. Please upload the file first.'
        },
        404
      )
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: {
        fileUrl,
        updatedAt: new Date()
      },
      select: EVENT_SELECT
    })

    const formattedEvent = await formatEventResponse(updatedEvent)

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
