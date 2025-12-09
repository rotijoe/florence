import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse } from '@packages/types'
import { generateUniqueSlug } from '../../../helpers/index.js'
import { createTrackSchema } from '../validators.js'
import { badRequestFromZod } from '../helpers.js'
import { TRACK_FULL_SELECT } from '../constants.js'

export async function handler(c: Context<{ Variables: AppVariables }>) {
  try {
    const currentUser = c.get('user')

    if (!currentUser) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        401
      )
    }

    const body = await c.req.json().catch(() => ({}))
    const parseResult = createTrackSchema.safeParse(body)

    if (!parseResult.success) {
      return badRequestFromZod(c, parseResult.error)
    }

    const { title, description } = parseResult.data

    const slug = await generateUniqueSlug(currentUser.id, title.trim())

    const track = await prisma.healthTrack.create({
      data: {
        userId: currentUser.id,
        title: title.trim(),
        slug,
        description: description === '' ? null : description
      },
      select: TRACK_FULL_SELECT
    })

    const response: ApiResponse<typeof track> = {
      success: true,
      data: track
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
