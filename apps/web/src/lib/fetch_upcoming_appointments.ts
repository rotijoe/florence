import { SERVER_API_BASE_URL } from '@/constants/api'
import type { UpcomingAppointmentsResponse, ApiResponse } from '@packages/types'
import { cookies } from 'next/headers'

export async function fetchUpcomingAppointments(
  userId: string,
  limit: number = 5
): Promise<UpcomingAppointmentsResponse> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(
      `${SERVER_API_BASE_URL}/api/users/${userId}/appointments/upcoming?limit=${limit}`,
      {
        cache: 'no-store',
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader })
        }
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return { appointments: [], hasMore: false }
      }
      throw new Error(`Failed to fetch upcoming appointments: ${response.statusText}`)
    }

    const data: ApiResponse<UpcomingAppointmentsResponse> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch upcoming appointments')
    }

    return data.data
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    }
    throw error
  }
}

