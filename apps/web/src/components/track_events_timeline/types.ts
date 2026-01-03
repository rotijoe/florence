import type { EventResponse } from '@packages/types'

export type TrackEventsTimelineProps = {
  userId: string
  trackSlug: string
  events: EventResponse[]
}

