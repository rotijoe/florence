import type { TrackOption } from '@/components/hub_quick_actions/types'

export interface HubQuickActionSymptomProps {
  tracks: TrackOption[]
  userId: string
  onSuccess?: () => void
}

