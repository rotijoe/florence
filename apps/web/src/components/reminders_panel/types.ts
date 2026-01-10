import type { Notification } from '@/app/[userId]/types'
import type { TrackOption } from '@/components/hub_quick_actions/types'

export interface RemindersPanelProps {
  notifications: Notification[]
  tracks: TrackOption[]
  userId: string
  title?: string
  description?: string
  emptyStateMessage?: string
  addEventHref?: string
}

