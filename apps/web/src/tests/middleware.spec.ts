import { NextRequest, NextResponse } from 'next/server'
import { middleware as middlewareHandler } from '../middleware'

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url: URL) => ({ type: 'redirect', url: url.toString() }))
  }
}))

describe('middleware', () => {
  const middleware = middlewareHandler

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function createMockRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
    const url = new URL(`http://localhost:3000${pathname}`)

    return {
      nextUrl: {
        pathname
      },
      url: url.toString(),
      cookies: {
        get: (name: string) => {
          const value = cookies[name]
          return value ? { value } : undefined
        }
      }
    } as unknown as NextRequest
  }

  describe('non-protected routes', () => {
    it('should allow non-track routes to pass through', async () => {
      const request = createMockRequest('/')
      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })

    it('should allow other routes to pass through', async () => {
      const request = createMockRequest('/some-other-route')
      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })

    it('should not check cookies for non-protected routes', async () => {
      const request = createMockRequest('/about')
      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })
  })

  describe('protected routes - cookie presence', () => {
    it('should redirect to home when no session cookie is present', async () => {
      const request = createMockRequest('/user-1/tracks/track-slug')

      const response = await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/'
        })
      )
      expect(response).toEqual({
        type: 'redirect',
        url: expect.stringContaining('/')
      })
    })

    it('should redirect to home when session cookie is empty', async () => {
      const request = createMockRequest('/user-1/tracks/track-slug', {
        'better-auth.session_token': ''
      })

      const response = await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      expect(response).toEqual({
        type: 'redirect',
        url: expect.stringContaining('/')
      })
    })

    it('should allow access when session cookie is present', async () => {
      const request = createMockRequest('/user-1/tracks/track-slug', {
        'better-auth.session_token': 'valid-session-token'
      })

      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })
  })

  describe('route matching', () => {
    it('should protect track page routes', async () => {
      const request = createMockRequest('/user-1/tracks/my-track', {
        'better-auth.session_token': 'valid-token'
      })

      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })

    it('should protect event page routes', async () => {
      const request = createMockRequest('/user-1/tracks/my-track/event-123', {
        'better-auth.session_token': 'valid-token'
      })

      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })

    it('should protect nested routes under tracks', async () => {
      const request = createMockRequest('/user-1/tracks/my-track/nested/path', {
        'better-auth.session_token': 'valid-token'
      })

      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(response).toEqual({ type: 'next' })
    })

    it('should redirect nested routes when no cookie present', async () => {
      const request = createMockRequest('/user-1/tracks/my-track/nested/path')

      const response = await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      expect(response).toEqual({
        type: 'redirect',
        url: expect.stringContaining('/')
      })
    })
  })
})
