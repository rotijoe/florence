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
  slug: string
  description?: string
  createdAt: Date
  updatedAt: Date
  events: Event[]
}

export type Event = {
  id: string
  date: Date
  track: HealthTrack
  trackId: string
  type: EventType
  title: string
  notes?: string
  fileUrl?: string
  symptomType?: string
  severity?: number
  createdAt: Date
}

export enum EventType {
  NOTE = 'NOTE',
  APPOINTMENT = 'APPOINTMENT',
  RESULT = 'RESULT',
  LETTER = 'LETTER',
  FEELING = 'FEELING',
  EXERCISE = 'EXERCISE',
  SYMPTOM = 'SYMPTOM'
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type TrackResponse = {
  id: string
  name: string
  slug: string
  createdAt: string
}

export type EventResponse = {
  id: string
  trackId: string
  date: string
  type: EventType
  title: string
  notes?: string | null
  fileUrl?: string | null
  symptomType?: string | null
  severity?: number | null
  createdAt: string
  updatedAt: string
}
