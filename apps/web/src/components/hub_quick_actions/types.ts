export type HubQuickActionKind = 'logSymptom' | 'createEvent' | 'addAppointment'

export interface HubQuickActionOption {
  value: string
  label: string
}

export interface TrackOption {
  slug: string
  title: string
  lastUpdatedAt: Date | string
}

export interface HubQuickActionsProps {
  eventOptions: HubQuickActionOption[]
  tracks: TrackOption[]
  userId: string
  onSelectOption?: (args: { kind: HubQuickActionKind; value: string }) => void
}
