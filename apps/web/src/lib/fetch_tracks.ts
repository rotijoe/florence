import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { TrackResponse, ApiResponse } from '@packages/types'

export async function fetchTracksWithCookies(userId: string): Promise<TrackResponse[]> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const response = await fetch(`${SERVER_API_BASE_URL}/api/users/${userId}/tracks`, {
    cache: 'no-store',
    headers: {
      ...(cookieHeader && { Cookie: cookieHeader })
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tracks: ${response.statusText}`)
  }

  const data: ApiResponse<TrackResponse[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch tracks')
  }

  return data.data
}

