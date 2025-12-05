export type HubQuickActionKind = 'logSymptom' | 'createEvent' | 'addAppointment'

export interface HubQuickActionOption {
  value: string
  label: string
}

export interface HubQuickActionsProps {
  symptomOptions: HubQuickActionOption[]
  eventOptions: HubQuickActionOption[]
  appointmentOptions: HubQuickActionOption[]
  onSelectOption?: (args: { kind: HubQuickActionKind; value: string }) => void
}

