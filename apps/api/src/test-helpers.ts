/**
 * Shared test helpers for API tests
 */

/**
 * Creates a mock Better Auth session object for testing
 * @param userId - The user ID for the session
 * @returns A mock session object matching Better Auth's session structure
 */
export function createMockSession(userId: string) {
  return {
    user: {
      id: userId,
      email: 'test@example.com',
      emailVerified: false,
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    session: {
      id: 'session-1',
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token: 'test-token',
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}
