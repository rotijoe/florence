import type { UserWithTracks, ApiResponse } from './types'

export async function fetchUserData(): Promise<UserWithTracks> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

  const response = await fetch(`${apiUrl}/api/user/me`, {
    credentials: 'include'
  })

  const data: ApiResponse<UserWithTracks> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch user data')
  }

  if (!data.data) {
    throw new Error('No user data received')
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
