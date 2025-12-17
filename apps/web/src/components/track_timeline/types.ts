import type { EventResponse } from '@packages/types'

export type TrackTimelineProps = {
  userId: string
  trackSlug: string
  futureAppointments: EventResponse[]
  pastEvents: EventResponse[]
  activeEventId?: string | null
}


