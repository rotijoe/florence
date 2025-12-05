import type { HubQuickActionOption } from './types'

export const HUB_SYMPTOM_QUICK_ACTIONS: HubQuickActionOption[] = [
  { value: 'pain', label: 'Pain' },
  { value: 'mood', label: 'Mood' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'energy', label: 'Energy' }
]

export const HUB_EVENT_QUICK_ACTIONS: HubQuickActionOption[] = [
  { value: 'new-diagnosis', label: 'New diagnosis' },
  { value: 'medication-change', label: 'Medication change' },
  { value: 'test-result', label: 'Test result' },
  { value: 'flare-up', label: 'Flare‑up' }
]

export const HUB_APPOINTMENT_QUICK_ACTIONS: HubQuickActionOption[] = [
  { value: 'gp', label: 'GP appointment' },
  { value: 'specialist', label: 'Specialist appointment' },
  { value: 'therapy', label: 'Therapy session' },
  { value: 'scan', label: 'Scan or test' }
]

