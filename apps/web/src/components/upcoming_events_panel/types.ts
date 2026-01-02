export interface UpcomingEvent {
  id: string
  title: string
  datetime: Date | string
  href: string
}

export interface UpcomingEventsPanelProps {
  title: string
  upcomingEvents: UpcomingEvent[]
  hasMore?: boolean
  onShowMore?: () => Promise<void>
  emptyStateMessage?: string
}

