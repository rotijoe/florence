import {
  EventType,
  type TrackResponse,
  type EventResponse,
  type ApiResponse
} from '@packages/types'
import { SERVER_API_BASE_URL } from '@/constants/api'
import type { Notification } from '@/app/[userId]/types'
import { cookies } from 'next/headers'

export async function fetchTrack(userId: string, slug: string): Promise<TrackResponse> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(`${SERVER_API_BASE_URL}/api/users/${userId}/tracks/${slug}`, {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch track: ${response.statusText}`)
    }

    const data: ApiResponse<TrackResponse> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch track')
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

export async function fetchTrackEvents(userId: string, slug: string): Promise<EventResponse[]> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(
      `${SERVER_API_BASE_URL}/api/users/${userId}/tracks/${slug}/events?sort=desc&limit=100`,
      {
        cache: 'no-store',
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader })
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`)
    }

    const data: ApiResponse<EventResponse[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch events')
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

export function splitEventsByTime(
  events: EventResponse[],
  now: Date
): { futureAppointments: EventResponse[]; pastEvents: EventResponse[] } {
  const futureAppointments: EventResponse[] = []
  const pastEvents: EventResponse[] = []
  const nowTime = now.getTime()

  for (const event of events) {
    const isFutureAppointment =
      event.type === EventType.APPOINTMENT && new Date(event.date).getTime() > nowTime

    if (isFutureAppointment) {
      futureAppointments.push(event)
      continue
    }

    pastEvents.push(event)
  }

  return { futureAppointments, pastEvents }
}

export function sortFutureAppointments(events: EventResponse[]): EventResponse[] {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function filterNotificationsForTrack(
  notifications: Notification[],
  userId: string,
  trackSlug: string
): Notification[] {
  function isMatchingAppointmentHref(href: string | undefined): boolean {
    if (!href) return false

    try {
      const url = new URL(href, 'http://localhost')
      const parts = url.pathname.split('/').filter(Boolean)
      return parts[0] === userId && parts[1] === 'tracks' && parts[2] === trackSlug
    } catch {
      return false
    }
  }

  return notifications.filter((notification) => {
    if (notification.type === 'symptomReminder') {
      return notification.trackSlug === trackSlug
    }

    if (notification.type === 'appointmentDetails') {
      return isMatchingAppointmentHref(notification.href)
    }

    return false
  })
}
