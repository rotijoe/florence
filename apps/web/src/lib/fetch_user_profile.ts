import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { UserProfileResponse, ApiResponse } from '@packages/types'

export async function fetchUserProfileWithCookies(userId: string): Promise<UserProfileResponse> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const response = await fetch(`${SERVER_API_BASE_URL}/api/users/${userId}`, {
    cache: 'no-store',
    headers: {
      ...(cookieHeader && { Cookie: cookieHeader })
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`)
  }

  const data: ApiResponse<UserProfileResponse> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch user profile')
  }

  return data.data
}

