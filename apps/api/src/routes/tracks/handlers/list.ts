import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse, TrackResponse } from '@packages/types'
import { formatTrack } from '../helpers.js'
import { TRACK_FULL_SELECT } from '../constants.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const userId = c.req.param('userId')

    const tracks = await prisma.healthTrack.findMany({
      where: { userId },
      select: TRACK_FULL_SELECT,
      orderBy: { createdAt: 'desc' }
    })

    const formattedTracks: TrackResponse[] = tracks.map((track) => formatTrack(track))

    const response: ApiResponse<TrackResponse[]> = {
      success: true,
      data: formattedTracks
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

