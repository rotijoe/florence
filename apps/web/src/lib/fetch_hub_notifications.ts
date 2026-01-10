import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { ApiResponse } from '@packages/types'
import type { Notification } from '@/app/[userId]/types'

export async function fetchHubNotifications(userId: string): Promise<Notification[]> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(`${SERVER_API_BASE_URL}/api/users/${userId}/hub/notifications`, {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`)
    }

    const data: ApiResponse<Notification[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch notifications')
    }

    return data.data
  } catch (error) {
    console.error('Failed to fetch hub notifications:', error)
    return []
  }
}

