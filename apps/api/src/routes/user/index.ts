import type { ApiResponse } from '@packages/types'
import type { AppVariables } from '../../types.js'
import { Hono } from 'hono'
import { prisma } from '@packages/database'
import { generateUniqueSlug } from '../../helpers'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/user/me', async (c) => {
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

    // Fetch user from database with their health tracks
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
})

app.post('/user/tracks', async (c) => {
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

    // Parse request body
    const body = await c.req.json().catch(() => ({}))
    const title = body.title
    const description = body.description ?? null

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: 'Title is required and must be a non-empty string'
        },
        400
      )
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(currentUser.id, title.trim())

    // Create track
    const track = await prisma.healthTrack.create({
      data: {
        userId: currentUser.id,
        title: title.trim(),
        slug,
        description: description === '' ? null : description
      },
      select: {
        id: true,
        userId: true,
        title: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
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
})

export default app
