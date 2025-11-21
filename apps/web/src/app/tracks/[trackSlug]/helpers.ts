import type { TrackResponse, EventResponse, ApiResponse } from '@packages/types'
import { SERVER_API_BASE_URL } from '@/constants/api'

export async function fetchTrack(slug: string): Promise<TrackResponse> {
  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/tracks/${slug}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch track: ${response.statusText}`)
    }

    const data: ApiResponse<TrackResponse> = await response.json()

    if (!data.success) {
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

export async function fetchTrackEvents(slug: string): Promise<EventResponse[]> {
  try {
    const response = await fetch(
      `${SERVER_API_BASE_URL}/api/tracks/${slug}/events?sort=desc&limit=100`,
      {
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`)
    }

    const data: ApiResponse<EventResponse[]> = await response.json()

    if (!data.success) {
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
