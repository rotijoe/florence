import type { Context } from 'hono'
import type { AppVariables } from '../../../types/index.js'
import { prisma } from '@packages/database'
import type { ApiResponse } from '@packages/types'

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

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        tracks: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            slug: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'User not found'
        },
        404
      )
    }

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user
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
