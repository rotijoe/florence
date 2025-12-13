import { cookies } from 'next/headers'
import type { AccountOverviewData, HealthTrackSummary, AppointmentSummary } from './types'
import type { UserWithTracks } from './tracks/types'
import type { ApiResponse, UpcomingAppointmentResponse } from '@packages/types'
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

export async function fetchUserMeWithCookies(): Promise<UserWithTracks> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const response = await fetch(`${SERVER_API_BASE_URL}/api/user/me`, {
    cache: 'no-store',
    headers: {
      ...(cookieHeader && { Cookie: cookieHeader })
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`)
  }

  const data: ApiResponse<UserWithTracks> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch user data')
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

export function mapTracksToHealthTrackSummary(
  tracks: UserWithTracks['tracks']
): HealthTrackSummary[] {
  return tracks.map((track: UserWithTracks['tracks'][number]) => ({
    id: track.id,
    title: track.title,
    description: track.description,
    slug: track.slug,
    lastUpdatedAt: track.updatedAt,
    lastUpdatedLabel: computeLastUpdatedLabel(track.updatedAt)
  }))
}

function formatAppointmentDateTime(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function mapUpcomingAppointmentsToSummary(
  appointments: UpcomingAppointmentResponse[],
  userId: string
): AppointmentSummary[] {
  return appointments.map((appt) => ({
    id: appt.eventId,
    title: appt.title,
    datetimeLabel: formatAppointmentDateTime(appt.date),
    location: null,
    href: `/${userId}/tracks/${appt.trackSlug}/${appt.eventId}`
  }))
}

export async function fetchUpcomingAppointmentsForHub(
  userId: string
): Promise<AppointmentSummary[]> {
  try {
    const appointments = await fetchUpcomingAppointments(5)
    return mapUpcomingAppointmentsToSummary(appointments, userId)
  } catch (error) {
    console.error('Failed to fetch upcoming appointments:', error)
    return []
  }
}

export function buildMockAccountOverviewData(name: string | null | undefined): AccountOverviewData {
  const displayName = name && name.trim().length > 0 ? name : 'there'

  return {
    user: {
      id: 'mock-user',
      name: displayName
    },
    notifications: [
      {
        id: 'appointment-details-reminder',
        type: 'appointmentDetails',
        title: 'Add details from your recent appointment',
        message:
          'Capture key points and any follow‑up actions from your last visit while they are still fresh.',
        ctaLabel: 'Add details'
      },
      {
        id: 'symptom-reminder',
        type: 'symptomReminder',
        title: 'Log how you are feeling today',
        message: 'A quick check‑in helps you and your care team see patterns over time.',
        ctaLabel: 'Log symptom'
      }
    ],
    healthTracks: [
      {
        id: 'sleep-track',
        title: 'Sleep',
        description: 'Track your sleep quality and routines.',
        lastUpdatedLabel: 'Updated yesterday',
        slug: 'sleep',
        lastUpdatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'pain-track',
        title: 'Pain',
        description: 'Log pain levels and triggers to spot patterns.',
        lastUpdatedLabel: 'Updated this morning',
        slug: 'pain',
        lastUpdatedAt: new Date()
      }
    ],
    appointments: [
      {
        id: 'upcoming-appointment-1',
        title: 'GP follow‑up',
        datetimeLabel: 'Tue, 14 Jan · 10:30',
        location: 'City Health Centre',
        href: '/mock-user/tracks/sleep/upcoming-appointment-1'
      },
      {
        id: 'upcoming-appointment-2',
        title: 'Physio session',
        datetimeLabel: 'Fri, 17 Jan · 15:00',
        location: 'Riverside Clinic',
        href: '/mock-user/tracks/pain/upcoming-appointment-2'
      }
    ],
    recentActivity: []
  }
}
