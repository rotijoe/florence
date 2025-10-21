export interface HealthTrack {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  userId: string
}

export interface UserWithTracks {
  id: string
  name: string | null
  email: string
  tracks: HealthTrack[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
