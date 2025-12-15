import type { Notification } from '@/app/[userId]/types'
import type { TrackOption } from '@/components/hub_quick_actions/types'

export interface HubNotificationsProps {
  notifications: Notification[]
  tracks: TrackOption[]
  userId: string
}
