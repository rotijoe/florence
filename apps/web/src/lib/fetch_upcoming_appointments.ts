import { SERVER_API_BASE_URL } from '@/constants/api'
import type { UpcomingAppointmentResponse, ApiResponse } from '@packages/types'
import { cookies } from 'next/headers'

export async function fetchUpcomingAppointments(
  limit: number = 5
): Promise<UpcomingAppointmentResponse[]> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(
      `${SERVER_API_BASE_URL}/api/user/appointments/upcoming?limit=${limit}`,
      {
        cache: 'no-store',
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader })
        }
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return []
      }
      throw new Error(`Failed to fetch upcoming appointments: ${response.statusText}`)
    }

    const data: ApiResponse<UpcomingAppointmentResponse[]> = await response.json()

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
