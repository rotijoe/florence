export const EVENT_SELECT = {
  id: true,
  trackId: true,
  date: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  content: {
    select: {
      contentEnc: true
    }
  }
} as const

export const DEFAULT_LIMIT = 100
export const MAX_LIMIT = 1000
export const MIN_LIMIT = 1
