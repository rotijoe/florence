import type { EventResponse } from '@packages/types'

export type TrackEventTileUploadProps = {
  userId: string
  trackSlug: string
  event: EventResponse
  isActive?: boolean
  isUpcoming?: boolean
}

