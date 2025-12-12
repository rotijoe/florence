import type { HealthTrack } from '@packages/types'

export type HubQuickActionKind = 'symptom' | 'event' | 'track' | 'document'

export interface HubQuickActionOption {
  value: string
  label: string
}

export type TrackOption = Pick<HealthTrack, 'id' | 'slug' | 'title'> & {
  lastUpdatedAt: HealthTrack['updatedAt'] | string
}

export interface HubQuickActionsProps {
  tracks: TrackOption[]
  userId: string
  onSelectOption?: (args: { kind: HubQuickActionKind; value: string }) => void
  onTrackCreated?: () => void
}
