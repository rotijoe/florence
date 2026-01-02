import { API_BASE_URL } from '@/constants/api'
import type {
  UpcomingAppointmentsResponse,
  ApiResponse,
  UpcomingAppointmentResponse
} from '@packages/types'
import type { AppointmentSummary } from '@/app/[userId]/types'

/**
 * Formats an appointment time in 24-hour format (e.g., "14:30").
 *
 * @param datetime - The appointment date as a Date object or ISO string
 * @returns Formatted time string
 */
export function formatAppointmentTime(datetime: Date | string): string {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Formats an appointment date label based on how many days away it is.
 *
 * Rules:
 * - Today: "TODAY"
 * - Tomorrow: "TOM"
 * - 2-6 days from now: Day abbreviation (e.g., "SUN", "MON", "TUE")
 * - 7+ days from now: Date format (e.g., "9 JAN")
 *
 * @param datetime - The appointment date as a Date object or ISO string
 * @param referenceDate - Optional reference date (defaults to now)
 * @returns Formatted date label string
 */
export function formatAppointmentDateLabel(datetime: Date | string, referenceDate?: Date): string {
  const appointmentDate = typeof datetime === 'string' ? new Date(datetime) : datetime
  const refDate = referenceDate ?? new Date()

  // Normalize dates to start of day for accurate day comparison
  const appointmentDay = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate()
  )
  const refDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate())

  // Calculate days difference
  const diffMs = appointmentDay.getTime() - refDay.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'TODAY'
  }

  if (diffDays === 1) {
    return 'TOM'
  }

  if (diffDays >= 2 && diffDays <= 6) {
    // Return day abbreviation (SUN, MON, TUE, etc.)
    return appointmentDate.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  }

  // 7+ days: Return date format (e.g., "9 JAN")
  return appointmentDate
    .toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
    .toUpperCase()
}

/**
 * Maps UpcomingAppointmentResponse to AppointmentSummary
 */
function mapAppointmentsToSummary(
  appointments: UpcomingAppointmentResponse[],
  userId: string
): AppointmentSummary[] {
  return appointments.map((appt) => ({
    id: appt.eventId,
    title: appt.title,
    datetime: appt.date,
    location: null,
    href: `/${userId}/tracks/${appt.trackSlug}/${appt.eventId}`
  }))
}

/**
 * Fetches all upcoming appointments client-side (for "Show more" button).
 *
 * @param userId - The user ID
 * @returns Promise resolving to appointments array and hasMore flag
 */
export async function fetchAllAppointments(
  userId: string
): Promise<{ appointments: AppointmentSummary[]; hasMore: boolean }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/users/${userId}/appointments/upcoming?limit=50`,
      {
        cache: 'no-store',
        credentials: 'include' // Include cookies for authentication
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

    const appointments = mapAppointmentsToSummary(data.data.appointments, userId)
    return {
      appointments,
      hasMore: data.data.hasMore
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error(
        `Failed to connect to API server at ${API_BASE_URL}. Make sure the API server is running.`
      )
    }
    throw error
  }
}
