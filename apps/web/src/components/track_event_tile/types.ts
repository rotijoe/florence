import type { EventResponse } from '@packages/types'

export type TrackEventTileProps = {
  userId: string
  trackSlug: string
  event: EventResponse
  isActive?: boolean
  isUpcoming?: boolean
}


