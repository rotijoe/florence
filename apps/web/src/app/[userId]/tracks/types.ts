import type { HealthTrack as BaseHealthTrack, ApiResponse as BaseApiResponse } from '@packages/types'

export type HealthTrack = Omit<BaseHealthTrack, 'user' | 'events' | 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

export interface UserWithTracks {
  id: string
  name: string | null
  email: string
  tracks: HealthTrack[]
}

export type ApiResponse<T> = BaseApiResponse<T>
