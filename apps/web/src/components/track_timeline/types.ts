import type { EventResponse } from '@packages/types'

export type TrackTimelineProps = {
  userId: string
  trackSlug: string
  pastEvents: EventResponse[]
  activeEventId?: string | null
}



