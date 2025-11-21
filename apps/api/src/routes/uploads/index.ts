import type { ApiResponse, EventResponse, EventType } from '@packages/types'
import type { AppVariables } from '../../types.js'
import { Hono } from 'hono'
import { prisma } from '@packages/database'
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, getEventDocumentKey, getEventDocumentUrl, getStorageConfig } from '@/lib/s3.js'

const app = new Hono<{ Variables: AppVariables }>()

// Configuration constants
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

// Helper to verify event exists and belongs to track
async function verifyEventAndTrack(
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

// POST /tracks/:slug/events/:eventId/upload-url
app.post('/tracks/:slug/events/:eventId/upload-url', async (c) => {
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

    // Parse and validate request body
    const body = await c.req.json().catch(() => ({}))
    const { fileName, contentType, size } = body

    // Validate fileName
    if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: 'fileName is required and must be a non-empty string'
        },
        400
      )
    }

    // Validate contentType
    if (!contentType || typeof contentType !== 'string') {
      return c.json(
        {
          success: false,
          error: 'contentType is required and must be a string'
        },
        400
      )
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return c.json(
        {
          success: false,
          error: `contentType must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`
        },
        400
      )
    }

    // Validate size
    if (typeof size !== 'number' || size <= 0) {
      return c.json(
        {
          success: false,
          error: 'size is required and must be a positive number'
        },
        400
      )
    }

    if (size > MAX_FILE_SIZE_BYTES) {
      return c.json(
        {
          success: false,
          error: `File size exceeds maximum of ${MAX_FILE_SIZE_BYTES} bytes (${Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024)}MB)`
        },
        400
      )
    }

    // Verify event exists and belongs to track
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

    // Generate S3 key and presigned URL
    const key = getEventDocumentKey(eventId, fileName)
    const config = getStorageConfig()

    const command = new PutObjectCommand({
      Bucket: config.s3BucketAppDocuments,
      Key: key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }) // 15 minutes
    const fileUrl = getEventDocumentUrl(key)
    const expiresAt = new Date(Date.now() + 900 * 1000).toISOString()

    const response: ApiResponse<{
      uploadUrl: string
      fileUrl: string
      key: string
      expiresAt: string
      maxSize: number
      allowedContentTypes: string[]
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
})

// POST /tracks/:slug/events/:eventId/upload-confirm
app.post('/tracks/:slug/events/:eventId/upload-confirm', async (c) => {
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

    // Parse and validate request body
    const body = await c.req.json().catch(() => ({}))
    const { fileUrl, key } = body

    // Validate fileUrl
    if (!fileUrl || typeof fileUrl !== 'string') {
      return c.json(
        {
          success: false,
          error: 'fileUrl is required and must be a string'
        },
        400
      )
    }

    // Validate key
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: 'key is required and must be a non-empty string'
        },
        400
      )
    }

    // Verify event exists and belongs to track
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

    // Optional: Verify object exists in S3
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

    // Update event with fileUrl
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: {
        fileUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        trackId: true,
        date: true,
        type: true,
        title: true,
        description: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const formattedEvent: EventResponse = {
      id: updatedEvent.id,
      trackId: updatedEvent.trackId,
      date: updatedEvent.date.toISOString(),
      type: updatedEvent.type as EventType,
      title: updatedEvent.title,
      description: updatedEvent.description,
      fileUrl: updatedEvent.fileUrl,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString()
    }

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
})

export default app
