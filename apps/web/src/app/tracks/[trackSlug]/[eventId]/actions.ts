'use server'

import { API_BASE_URL } from '@/constants/api'
import type { EventResponse, ApiResponse } from '@packages/types'
import { revalidatePath } from 'next/cache'

export type UpdateEventState = {
  event?: EventResponse
  error?: string
}

export async function updateEventAction(
  prevState: UpdateEventState | null,
  formData: FormData
): Promise<UpdateEventState> {
  const eventId = formData.get('eventId') as string
  const trackSlug = formData.get('trackSlug') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null

  if (!eventId || !trackSlug) {
    return {
      error: 'Missing required fields: eventId and trackSlug are required',
    }
  }

  if (!title || title.trim().length === 0) {
    return {
      error: 'Title is required and must be a non-empty string',
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tracks/${trackSlug}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description === '' ? null : description,
        }),
      }
    )

    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json().catch(() => ({
        success: false,
        error: `Failed to update event: ${response.statusText}`,
      }))
      return {
        error: errorData.error || `Failed to update event: ${response.statusText}`,
      }
    }

    const data: ApiResponse<EventResponse> = await response.json()

    if (!data.success || !data.data) {
      return {
        error: data.error || 'Failed to update event',
      }
    }

    // Revalidate the page to ensure fresh data on next render
    revalidatePath(`/tracks/${trackSlug}/${eventId}`)
    revalidatePath(`/tracks/${trackSlug}`)

    return {
      event: data.data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      error: `Failed to update event: ${errorMessage}`,
    }
  }
}

