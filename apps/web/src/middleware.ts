import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'better-auth.session_token'

async function middlewareHandler(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Match routes like /:userId/tracks/:trackSlug or /:userId/tracks/:trackSlug/:eventId
  const trackRouteMatch = pathname.match(/^\/([^/]+)\/tracks(\/.*)?$/)

  if (!trackRouteMatch) {
    // Not a protected route, allow through
    return NextResponse.next()
  }

  // Check for session cookie presence (lightweight gate)
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Cookie exists, allow through to layout for full validation
  return NextResponse.next()
}

export const middleware = middlewareHandler

export const config = {
  matcher: [
    // Match all routes under /:userId/tracks/*
    '/:userId/tracks/:path*'
  ]
}
