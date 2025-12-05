import type { Notification } from '@/app/[userId]/types'

export function hubHasNotifications(notifications: Notification[]): boolean {
  return Array.isArray(notifications) && notifications.length > 0
}

