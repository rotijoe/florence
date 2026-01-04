import type { EventResponse } from '@packages/types'

export type TrackEventTileStandardProps = {
  userId: string
  trackSlug: string
  event: EventResponse
  isActive?: boolean
  isUpcoming?: boolean
}

