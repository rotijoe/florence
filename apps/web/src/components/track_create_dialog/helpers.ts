import { API_BASE_URL } from '@/constants/api'
import type { CreateTrackResponse } from './types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function createTrack(
  userId: string,
  title: string,
  description?: string | null
): Promise<CreateTrackResponse> {
  const body: { title: string; description?: string | null } = { title }
  if (description !== undefined) {
    body.description = description
  }

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(body)
  })

  const data: ApiResponse<CreateTrackResponse> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create track')
  }

  if (!data.data) {
    throw new Error('No track data received')
  }

  return data.data
}
