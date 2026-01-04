import type { TrackOption } from '@/components/hub_quick_actions/types'

export interface HubQuickActionEventProps {
  tracks: TrackOption[]
  userId: string
  hasTracks: boolean
}

