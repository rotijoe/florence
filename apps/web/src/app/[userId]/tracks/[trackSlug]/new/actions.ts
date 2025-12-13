'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API_BASE_URL } from '@/constants/api'
import { ApiResponse, EventResponse } from '@packages/types'

export type CreateEventOnSaveResult = {
  error?: string
}

export async function createEventOnSaveAction(
  formData: FormData
): Promise<CreateEventOnSaveResult> {
  const userId = formData.get('userId') as string
  const trackSlug = formData.get('trackSlug') as string
  const title = formData.get('title') as string
  const notes = formData.get('notes') as string | null
  const type = formData.get('type') as string | null
  const date = formData.get('date') as string | null

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

    const body: Record<string, unknown> = {
      title: title.trim(),
      notes: notes === '' ? null : notes
    }

    if (type) {
      body.type = type
    }

    if (date) {
      body.date = new Date(date).toISOString()
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tracks/${trackSlug}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      body: JSON.stringify(body)
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

    // Redirect to the new event page
    redirect(`/${userId}/tracks/${trackSlug}/${data.data.id}`)
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
