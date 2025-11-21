// For client-side requests (browser)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// For server-side requests (Next.js server components)
// Use API_URL (server-only) or fall back to NEXT_PUBLIC_API_URL
export const SERVER_API_BASE_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
