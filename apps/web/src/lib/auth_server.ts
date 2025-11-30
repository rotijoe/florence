import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export interface SessionUser {
  id: string
  name: string | null
  email: string
}

export interface SessionResponse {
  user: SessionUser | null
  session: unknown | null
}

export async function getServerSession(): Promise<SessionResponse | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const data: SessionResponse = await response.json()
    return data
  } catch {
    return null
  }
}
