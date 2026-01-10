import type { Context } from 'hono'
import type { AppVariables } from '@/types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse } from '@packages/types'
import { getObjectKeyFromUrl, deleteFile } from '@/lib/s3/index.js'
import { trackNotFoundResponse } from '@/helpers/index.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')

    const track = await prisma.healthTrack.findFirst({
      where: { userId, slug },
      include: {
        events: {
          select: {
            fileUrl: true
          }
        }
      }
    })

    if (!track) {
      return trackNotFoundResponse(c)
    }

    // Delete S3 files for all events with attachments
    for (const event of track.events) {
      if (event.fileUrl) {
        const key = getObjectKeyFromUrl(event.fileUrl)
        if (key) {
          try {
            await deleteFile(key)
          } catch (error) {
            console.error('Error deleting file from S3:', error)
            // Continue with deletion even if S3 delete fails
          }
        }
      }
    }

    // Delete track (cascades to delete all events automatically)
    await prisma.healthTrack.delete({
      where: {
        id: track.id
      }
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
