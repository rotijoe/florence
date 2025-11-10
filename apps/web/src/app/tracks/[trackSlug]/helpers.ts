import type { TrackResponse, EventResponse, ApiResponse } from '@packages/types'
import { API_BASE_URL } from '@/constants/api'

export async function fetchTrack(slug: string): Promise<TrackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/tracks/${slug}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch track: ${response.statusText}`)
  }

  const data: ApiResponse<TrackResponse> = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch track')
  }

  return data.data
}

export async function fetchTrackEvents(slug: string): Promise<EventResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/tracks/${slug}/events?sort=desc&limit=100`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`)
  }

  const data: ApiResponse<EventResponse[]> = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch events')
  }

  return data.data
}
