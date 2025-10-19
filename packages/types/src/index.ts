export type User = {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  tracks: HealthTrack[]
}

export type HealthTrack = {
  id: string
  user: User
  userId: string
  title: string
  description?: string
  createdAt: Date
  events: Event[]
}

export type Event = {
  id: string
  date: Date
  track: HealthTrack
  trackId: string
  type: EventType
  title: string
  description?: string
  fileUrl?: string
  createdAt: Date
}

export enum EventType {
  NOTE = 'NOTE',
  APPOINTMENT = 'APPOINTMENT',
  RESULT = 'RESULT',
  LETTER = 'LETTER',
  FEELING = 'FEELING',
  EXERCISE = 'EXERCISE'
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}
