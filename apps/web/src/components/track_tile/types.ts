import type { HealthTrack } from '@/app/[userId]/tracks/types'

export type TrackTileTrack = Pick<
  HealthTrack,
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


