import type { HealthTrack } from '@packages/types'

export type HubQuickActionKind = 'logSymptom' | 'createEvent' | 'addAppointment'

export interface HubQuickActionOption {
  value: string
  label: string
}

export type TrackOption = Pick<HealthTrack, 'slug' | 'title'> & {
  lastUpdatedAt: HealthTrack['updatedAt'] | string
}

export interface HubQuickActionsProps {
  eventOptions: HubQuickActionOption[]
  tracks: TrackOption[]
  userId: string
  onSelectOption?: (args: { kind: HubQuickActionKind; value: string }) => void
}
