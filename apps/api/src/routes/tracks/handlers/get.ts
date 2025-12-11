import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, TrackResponse } from '@packages/types'
import { formatTrack } from '../helpers.js'
import { TRACK_SELECT } from '../constants.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')
    const slug = c.req.param('slug')

    const track = await prisma.healthTrack.findFirst({
      where: { userId, slug },
      select: TRACK_SELECT
    })

    if (!track) {
      return c.json(
        {
          success: false,
          error: 'Track not found'
        },
        404
      )
    }

    const formattedTrack = formatTrack(track)

    const response: ApiResponse<TrackResponse> = {
      success: true,
      data: formattedTrack
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

