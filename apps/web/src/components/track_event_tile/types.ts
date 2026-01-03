import type { EventResponse } from '@packages/types'

export type TrackEventTileProps = {
  userId: string
  trackSlug: string
  event: EventResponse
  isActive?: boolean
  isUpcoming?: boolean
}

export type TrackEventTileSymptomProps = {
  userId: string
  trackSlug: string
  event: EventResponse
}

export type TrackEventTileStandardProps = {
  userId: string
  trackSlug: string
  event: EventResponse
  isActive?: boolean
  isUpcoming?: boolean
}

export type TrackEventTileUploadProps = {
  userId: string
  trackSlug: string
  event: EventResponse
  isActive?: boolean
  isUpcoming?: boolean
}
