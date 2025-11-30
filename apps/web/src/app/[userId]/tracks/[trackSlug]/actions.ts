'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CreateEventResult } from './[eventId]/actions'
import { API_BASE_URL } from '@/constants/api'
import { ApiResponse, EventResponse } from '@packages/types'

export async function createEventAction(formData: FormData): Promise<CreateEventResult> {
  const userId = formData.get('userId') as string
  const trackSlug = formData.get('trackSlug') as string

  if (!userId || !trackSlug) {
    return {
      error: 'Missing required fields: userId and trackSlug are required'
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
      body: JSON.stringify({})
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

    // Redirect to the new event page with ?new=1 flag
    redirect(`/${userId}/tracks/${trackSlug}/${data.data.id}?new=1`)
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // This is how Next.js signals a redirect – do NOT convert it to an error
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      error: `Failed to create event: ${errorMessage}`
    }
  }
}
