import type { HealthTrackSummary } from '@/app/[userId]/types'

export interface HubHealthTracksProps {
  userId: string
  tracks: HealthTrackSummary[]
}
