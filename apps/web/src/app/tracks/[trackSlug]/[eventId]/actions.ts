'use server'

import { API_BASE_URL } from '@/constants/api'
import type { EventResponse, ApiResponse } from '@packages/types'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type UpdateEventState = {
  event?: EventResponse
  error?: string
}

export type UploadIntentResult = {
  uploadUrl?: string
  fileUrl?: string
  key?: string
  expiresAt?: string
  error?: string
}

export type ConfirmUploadResult = {
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
      error: 'Missing required fields: eventId and trackSlug are required'
    }
  }

  if (!title || title.trim().length === 0) {
    return {
      error: 'Title is required and must be a non-empty string'
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${trackSlug}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description === '' ? null : description
      })
    })

    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json().catch(() => ({
        success: false,
        error: `Failed to update event: ${response.statusText}`
      }))
      return {
        error: errorData.error || `Failed to update event: ${response.statusText}`
      }
    }

    const data: ApiResponse<EventResponse> = await response.json()

    if (!data.success || !data.data) {
      return {
        error: data.error || 'Failed to update event'
      }
    }

    // Revalidate the page to ensure fresh data on next render
    revalidatePath(`/tracks/${trackSlug}/${eventId}`)
    revalidatePath(`/tracks/${trackSlug}`)

    return {
      event: data.data
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      error: `Failed to update event: ${errorMessage}`
    }
  }
}

export async function createEventUploadIntentAction(
  formData: FormData
): Promise<UploadIntentResult> {
  const eventId = formData.get('eventId') as string
  const trackSlug = formData.get('trackSlug') as string
  const fileName = formData.get('fileName') as string
  const contentType = formData.get('contentType') as string
  const size = formData.get('size') as string

  if (!eventId || !trackSlug) {
    return {
      error: 'Missing required fields: eventId and trackSlug are required'
    }
  }

  if (!fileName || !contentType || !size) {
    return {
      error: 'Missing required fields: fileName, contentType, and size are required'
    }
  }

  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(
      `${API_BASE_URL}/api/tracks/${trackSlug}/events/${eventId}/upload-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { Cookie: cookieHeader })
        },
        body: JSON.stringify({
          fileName,
          contentType,
          size: parseInt(size, 10)
        })
      }
    )

    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json().catch(() => ({
        success: false,
        error: `Failed to create upload intent: ${response.statusText}`
      }))
      return {
        error: errorData.error || `Failed to create upload intent: ${response.statusText}`
      }
    }

    const data: ApiResponse<{
      uploadUrl: string
      fileUrl: string
      key: string
      expiresAt: string
      maxSize: number
      allowedContentTypes: string[]
    }> = await response.json()

    if (!data.success || !data.data) {
      return {
        error: data.error || 'Failed to create upload intent'
      }
    }

    return {
      uploadUrl: data.data.uploadUrl,
      fileUrl: data.data.fileUrl,
      key: data.data.key,
      expiresAt: data.data.expiresAt
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      error: `Failed to create upload intent: ${errorMessage}`
    }
  }
}

export async function confirmEventUploadAction(formData: FormData): Promise<ConfirmUploadResult> {
  const eventId = formData.get('eventId') as string
  const trackSlug = formData.get('trackSlug') as string
  const fileUrl = formData.get('fileUrl') as string
  const key = formData.get('key') as string

  if (!eventId || !trackSlug) {
    return {
      error: 'Missing required fields: eventId and trackSlug are required'
    }
  }

  if (!fileUrl || !key) {
    return {
      error: 'Missing required fields: fileUrl and key are required'
    }
  }

  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(
      `${API_BASE_URL}/api/tracks/${trackSlug}/events/${eventId}/upload-confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { Cookie: cookieHeader })
        },
        body: JSON.stringify({
          fileUrl,
          key
        })
      }
    )

    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json().catch(() => ({
        success: false,
        error: `Failed to confirm upload: ${response.statusText}`
      }))
      return {
        error: errorData.error || `Failed to confirm upload: ${response.statusText}`
      }
    }

    const data: ApiResponse<EventResponse> = await response.json()

    if (!data.success || !data.data) {
      return {
        error: data.error || 'Failed to confirm upload'
      }
    }

    // Revalidate the page to ensure fresh data on next render
    revalidatePath(`/tracks/${trackSlug}/${eventId}`)
    revalidatePath(`/tracks/${trackSlug}`)

    return {
      event: data.data
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      error: `Failed to confirm upload: ${errorMessage}`
    }
  }
}
