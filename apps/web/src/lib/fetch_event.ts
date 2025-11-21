import { SERVER_API_BASE_URL } from '@/constants/api'
import type { EventResponse, ApiResponse } from '@packages/types'

export async function fetchEvent(eventId: string, trackSlug: string): Promise<EventResponse> {
  const response = await fetch(`${SERVER_API_BASE_URL}/api/tracks/${trackSlug}/events/${eventId}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`)
  }

  const data: ApiResponse<EventResponse> = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch event')
  }

  return data.data
}
