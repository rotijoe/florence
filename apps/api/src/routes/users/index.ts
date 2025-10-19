import type { ApiResponse } from '@packages/types'
import type { AppVariables } from '../types.js'
import { Hono } from 'hono'
import { prisma } from '@packages/database'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/users', async (c) => {
  try {
    // Get the current user from context (set by session middleware)
    const currentUser = c.get('user')

    // Require authentication
    if (!currentUser) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        401
      )
    }

    // Fetch users from database with their health tracks
    const users = await prisma.user.findMany({
      include: {
        tracks: {
          include: {
            events: true
          }
        }
      }
    })

    const response: ApiResponse<typeof users> = {
      success: true,
      data: users
    }

    return c.json(response)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
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
