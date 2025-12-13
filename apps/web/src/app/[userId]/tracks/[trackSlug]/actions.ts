'use server'

import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/constants/api'
import { ApiResponse, EventResponse, EventType } from '@packages/types'

export type CreateEventResult = {
  event?: EventResponse
  error?: string
}

export async function createEventAction(formData: FormData): Promise<CreateEventResult> {
  const userId = formData.get('userId') as string
  const trackSlug = formData.get('trackSlug') as string
  const title = formData.get('title') as string
  const notes = formData.get('notes') as string | null
  const type = (formData.get('type') as EventType) || EventType.NOTE

  if (!userId || !trackSlug) {
    return {
      error: 'Missing required fields: userId and trackSlug are required'
    }
  }

  if (!title || title.trim().length === 0) {
    return {
      error: 'Title is required and must be a non-empty string'
    }
  }

  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tracks/${trackSlug}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      body: JSON.stringify({
        title: title.trim(),
        notes: notes === '' ? null : notes,
        type
      })
    })

    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json().catch(() => ({
        success: false,
        error: `Failed to create event: ${response.statusText}`
      }))
      return {
        error: errorData.error || `Failed to create event: ${response.statusText}`
      }
    }

    const data: ApiResponse<EventResponse> = await response.json()

    if (!data.success || !data.data) {
      return {
        error: data.error || 'Failed to create event'
      }
    }

    return {
      event: data.data
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      error: `Failed to create event: ${errorMessage}`
    }
  }
}
