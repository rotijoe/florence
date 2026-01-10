import type { TrackResponse, ApiResponse } from '@packages/types'

export async function fetchTracks(userId: string): Promise<TrackResponse[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

  const response = await fetch(`${apiUrl}/api/users/${userId}/tracks`, {
    credentials: 'include'
  })

  const data: ApiResponse<TrackResponse[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch tracks')
  }

  if (!data.data) {
    throw new Error('No tracks data received')
  }

  return data.data
}

export function formatTrackDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function buildAddEventHref(userId: string, trackSlug: string): string {
  const returnTo = encodeURIComponent(`/${userId}/tracks`)
  return `/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}`
}

export function getTrackDescriptionFallback(description?: string | null): string {
  if (typeof description === 'string' && description.trim().length > 0) {
    return description
  }

  return 'Add a short description to make this track easier to scan.'
}

export type LastEventPlaceholder = {
  label: string
  detail: string
  hint: string
}

export function getLastEventPlaceholder(): LastEventPlaceholder {
  return {
    label: 'Last event',
    detail: '—',
    hint: 'Event summaries are coming soon.'
  }
}
