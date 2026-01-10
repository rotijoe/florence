import { cookies } from 'next/headers'
import type { HealthTrackSummary, AppointmentSummary, Notification } from './types'
import type {
  ApiResponse,
  UpcomingAppointmentResponse,
  UserProfileResponse,
  TrackResponse
} from '@packages/types'
import type { UpcomingEvent } from '@/components/upcoming_events_panel/types'
import { SERVER_API_BASE_URL } from '@/constants/api'
import { fetchUpcomingAppointments } from '@/lib/fetch_upcoming_appointments'

export function getGreetingForUser(name: string | null | undefined): string {
  if (!name) {
    return 'Welcome back'
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return 'Welcome back'
  }

  return `Welcome back, ${trimmedName}`
}

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

export async function fetchTracksWithCookies(userId: string): Promise<TrackResponse[]> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const response = await fetch(`${SERVER_API_BASE_URL}/api/users/${userId}/tracks`, {
    cache: 'no-store',
    headers: {
      ...(cookieHeader && { Cookie: cookieHeader })
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tracks: ${response.statusText}`)
  }

  const data: ApiResponse<TrackResponse[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch tracks')
  }

  return data.data
}

export function computeLastUpdatedLabel(updatedAt: string | Date): string {
  const now = new Date()
  const updated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt

  const diffMs = now.getTime() - updated.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMinutes < 1) {
        return 'Updated just now'
      }
      return `Updated ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    }
    const currentHour = now.getHours()
    const updatedHour = updated.getHours()
    if (updatedHour >= 0 && updatedHour < 12 && currentHour >= 12) {
      return 'Updated this morning'
    }
    return 'Updated today'
  }

  if (diffDays === 1) {
    return 'Updated yesterday'
  }

  if (diffDays < 7) {
    return `Updated ${diffDays} days ago`
  }

  return updated.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function mapTracksToHealthTrackSummary(tracks: TrackResponse[]): HealthTrackSummary[] {
  return tracks.map((track) => ({
    id: track.id,
    title: track.title,
    description: track.description,
    slug: track.slug,
    lastUpdatedAt: track.updatedAt,
    lastUpdatedLabel: computeLastUpdatedLabel(track.updatedAt)
  }))
}

export function mapUpcomingAppointmentsToSummary(
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

export function mapUpcomingAppointmentsToUpcomingEvents(
  appointments: UpcomingAppointmentResponse[],
  userId: string
): UpcomingEvent[] {
  return appointments.map((appt) => ({
    id: appt.eventId,
    title: appt.title,
    datetime: appt.date,
    href: `/${userId}/tracks/${appt.trackSlug}/${appt.eventId}`
  }))
}

export async function fetchUpcomingAppointmentsForHub(userId: string): Promise<UpcomingEvent[]> {
  try {
    const result = await fetchUpcomingAppointments(userId, 3)
    return mapUpcomingAppointmentsToUpcomingEvents(result.appointments, userId)
  } catch (error) {
    console.error('Failed to fetch upcoming appointments:', error)
    return []
  }
}

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
