import type { Notification } from '@/app/[userId]/types'

export type NotificationOptimisticAction =
  | { type: 'REMOVE_BY_ID'; id: string }
  | { type: 'REMOVE_BY_TRACK_SLUG'; trackSlug: string }
  | { type: 'RESTORE'; notification: Notification }

export function notificationsOptimisticReducer(
  state: Notification[],
  action: NotificationOptimisticAction
): Notification[] {
  switch (action.type) {
    case 'REMOVE_BY_ID':
      return state.filter((n) => n.id !== action.id)
    case 'REMOVE_BY_TRACK_SLUG':
      return state.filter(
        (n) => !(n.type === 'symptomReminder' && n.trackSlug === action.trackSlug)
      )
    case 'RESTORE':
      return [...state, action.notification].sort((a, b) => a.id.localeCompare(b.id))
    default:
      return state
  }
}

export function hasNotifications(notifications: Notification[]): boolean {
  return Array.isArray(notifications) && notifications.length > 0
}

