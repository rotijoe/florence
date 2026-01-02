import type { AppointmentSummary } from '@/app/[userId]/types'

export interface HubUpcomingAppointmentsProps {
  appointments: AppointmentSummary[]
  userId: string
  hasMore: boolean
}
