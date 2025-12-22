import type { Context, Next } from 'hono'
import type { AppVariables } from '@/types/index.js'

/**
 * Middleware to enforce authentication and ownership for user-scoped routes.
 *
 * This middleware MUST be applied to all `/api/users/:userId/*` routes.
 *
 * Rules:
 * - Returns 401 if user is not authenticated
 * - Returns 404 if authenticated user's ID does not match :userId param (hides resource existence)
 */
export async function userScopeGuard(
  c: Context<{ Variables: AppVariables }>,
  next: Next
): Promise<Response | void> {
  const user = c.get('user')
  const userId = c.req.param('userId')

  // Check authentication
  if (!user) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized'
      },
      401
    )
  }

  // Check ownership (return 404 to hide resource existence)
  if (userId !== user.id) {
    return c.json(
      {
        success: false,
        error: 'Not found'
      },
      404
    )
  }

  // User is authenticated and owns the resource, proceed
  return next()
}

