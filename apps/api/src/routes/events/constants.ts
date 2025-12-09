export const EVENT_SELECT = {
  id: true,
  trackId: true,
  date: true,
  type: true,
  title: true,
  notes: true,
  fileUrl: true,
  symptomType: true,
  severity: true,
  createdAt: true,
  updatedAt: true
} as const

export const DEFAULT_LIMIT = 100
export const MAX_LIMIT = 1000
export const MIN_LIMIT = 1
