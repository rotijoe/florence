import type { TrackResponse } from '@packages/types'

export type TrackTileTrack = Pick<
  TrackResponse,
  'id' | 'title' | 'slug' | 'description' | 'createdAt' | 'updatedAt'
>

export type TrackTileProps = {
  userId: string
  track: TrackTileTrack
  isNotificationsEnabled: boolean
  onNotificationsEnabledChange: (next: boolean) => void
}

export type TrackTilesProps = {
  userId: string
  tracks: TrackTileTrack[]
}


