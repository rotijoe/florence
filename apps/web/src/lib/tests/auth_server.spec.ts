import { getServerSession } from '../auth_server'

// Mock next/headers
const mockCookieStore = {
  getAll: jest.fn()
}

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore))
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('auth_server', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: 'http://localhost:8787'
    }
    mockCookieStore.getAll.mockReturnValue([
      { name: 'better-auth.session_token', value: 'test-token' }
    ])
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getServerSession', () => {
    it('should return session data when API returns valid session', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com'
        },
        session: { id: 'session-1' }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      })

      const result = await getServerSession()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/auth/get-session',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Cookie: 'better-auth.session_token=test-token'
          }),
          cache: 'no-store'
        })
      )
      expect(result).toEqual(mockSession)
    })

    it('should return null when API returns non-ok response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await getServerSession()

      expect(result).toBeNull()
    })

    it('should return null when fetch throws an error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await getServerSession()

      expect(result).toBeNull()
    })

    it('should use default API URL when env var is not set', async () => {
      delete process.env.NEXT_PUBLIC_API_URL

      // Need to re-import to test default URL
      jest.resetModules()
      const mockCookieStoreForDefault = {
        getAll: jest
          .fn()
          .mockReturnValue([{ name: 'better-auth.session_token', value: 'test-token' }])
      }
      jest.doMock('next/headers', () => ({
        cookies: jest.fn(() => Promise.resolve(mockCookieStoreForDefault))
      }))

      const { getServerSession: freshGetServerSession } = await import('../auth_server')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: null, session: null })
      })

      await freshGetServerSession()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/auth/get-session',
        expect.any(Object)
      )
    })

    it('should forward cookies from the request', async () => {
      mockCookieStore.getAll.mockReturnValue([
        { name: 'better-auth.session_token', value: 'abc123' },
        { name: 'other-cookie', value: 'value' }
      ])
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: null, session: null })
      })

      await getServerSession()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: 'better-auth.session_token=abc123; other-cookie=value'
          })
        })
      )
    })

    it('should not set Cookie header when no cookies exist', async () => {
      mockCookieStore.getAll.mockReturnValue([])
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: null, session: null })
      })

      await getServerSession()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Cookie: expect.anything()
          })
        })
      )
    })
  })
})
