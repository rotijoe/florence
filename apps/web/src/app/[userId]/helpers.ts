import type { HealthTrackSummary, AppointmentSummary, Notification } from './types'
import type {
  ApiResponse,
  UpcomingAppointmentResponse,
  TrackResponse
} from '@packages/types'
import type { UpcomingEvent } from '@/components/upcoming_events_panel/types'
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

// Re-export for convenience (functions moved to lib/)
export { fetchTracksWithCookies } from '@/lib/fetch_tracks'
export { fetchUserProfileWithCookies } from '@/lib/fetch_user_profile'
export { fetchHubNotifications } from '@/lib/fetch_hub_notifications'
