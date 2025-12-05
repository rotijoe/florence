export type NotificationType = 'appointmentDetails' | 'symptomReminder'

export interface UserSummary {
  id: string
  name: string | null
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  ctaLabel?: string
}

export interface HealthTrackSummary {
  id: string
  title: string
  description?: string | null
  lastUpdatedLabel: string
}

export interface AppointmentSummary {
  id: string
  title: string
  datetimeLabel: string
  location?: string | null
}

export interface RecentActivityItem {
  id: string
  label: string
  timestampLabel: string
}

export interface AccountOverviewData {
  user: UserSummary
  notifications: Notification[]
  healthTracks: HealthTrackSummary[]
  appointments: AppointmentSummary[]
  recentActivity: RecentActivityItem[]
}
