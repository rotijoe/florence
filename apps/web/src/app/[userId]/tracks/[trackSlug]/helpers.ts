import type { TrackResponse, EventResponse, ApiResponse } from '@packages/types'
import { SERVER_API_BASE_URL } from '@/constants/api'
import { cookies } from 'next/headers'

export async function fetchTrack(userId: string, slug: string): Promise<TrackResponse> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(`${SERVER_API_BASE_URL}/api/users/${userId}/tracks/${slug}`, {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch track: ${response.statusText}`)
    }

    const data: ApiResponse<TrackResponse> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch track')
    }

    return data.data
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    }
    throw error
  }
}

export async function fetchTrackEvents(userId: string, slug: string): Promise<EventResponse[]> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(
      `${SERVER_API_BASE_URL}/api/users/${userId}/tracks/${slug}/events?sort=desc&limit=100`,
      {
        cache: 'no-store',
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader })
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`)
    }

    const data: ApiResponse<EventResponse[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch events')
    }

    return data.data
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    }
    throw error
  }
}
