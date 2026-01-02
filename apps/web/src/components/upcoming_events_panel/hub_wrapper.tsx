'use client'

import { useState } from 'react'
import { UpcomingEventsPanel } from './index'
import type { UpcomingEvent } from './types'
import type { AppointmentSummary } from '@/app/[userId]/types'
import { API_BASE_URL } from '@/constants/api'
import type {
  UpcomingAppointmentsResponse,
  ApiResponse,
  UpcomingAppointmentResponse
} from '@packages/types'

interface HubUpcomingEventsPanelProps {
  title: string
  initialEvents: AppointmentSummary[]
  userId: string
  hasMore: boolean
}

function mapAppointmentSummaryToUpcomingEvent(appointment: AppointmentSummary): UpcomingEvent {
  return {
    id: appointment.id,
    title: appointment.title,
    datetime: appointment.datetime,
    href: appointment.href
  }
}

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

async function fetchAllAppointments(
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

export function HubUpcomingEventsPanel({
  title,
  initialEvents,
  userId,
  hasMore
}: HubUpcomingEventsPanelProps) {
  const [allEvents, setAllEvents] = useState<UpcomingEvent[]>(
    initialEvents.map(mapAppointmentSummaryToUpcomingEvent)
  )
  const [showAll, setShowAll] = useState(false)

  async function handleShowMore() {
    const result = await fetchAllAppointments(userId)
    setAllEvents(result.appointments.map(mapAppointmentSummaryToUpcomingEvent))
    setShowAll(true)
  }

  const events = showAll ? allEvents : initialEvents.map(mapAppointmentSummaryToUpcomingEvent)
  const shouldShowMore = hasMore && !showAll

  return (
    <UpcomingEventsPanel
      title={title}
      upcomingEvents={events}
      hasMore={shouldShowMore}
      onShowMore={handleShowMore}
    />
  )
}

