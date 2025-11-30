import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrackEventCard } from '@/components/track_event_card'
import { formatDateLabel, groupEventsByDate } from './helpers'
import type {
  DateGroupProps,
  EventsGroupProps,
  TimelineRowProps,
  TrackEventListProps
} from './types'

export function TrackEventList({ events, trackSlug, userId, activeEventId }: TrackEventListProps) {
  if (events.length === 0) {
    return renderEmptyState()
  }

  const dateGroups = groupEventsByDate(events)

  return (
    <div className="relative space-y-6 pl-10">
      {renderTimelineConnector()}
      {dateGroups.map((group, groupIndex) =>
        renderDateGroup({
          group,
          groupIndex,
          totalGroups: dateGroups.length,
          trackSlug,
          userId,
          activeEventId
        })
      )}
    </div>
  )
}

function renderEmptyState() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        No events recorded yet for this track.
      </CardContent>
    </Card>
  )
}

function renderDateGroup({ group, groupIndex, trackSlug, userId, activeEventId }: DateGroupProps) {
  return (
    <div key={groupIndex}>
      {renderDateLabel(group.date)}
      {renderEventsGroup({
        events: group.events,
        trackSlug,
        userId,
        activeEventId
      })}
    </div>
  )
}

function renderDateLabel(date: string) {
  const dateLabel = formatDateLabel(date)

  return (
    <div className="mb-2 sticky top-0 bg-background h-8">
      <span className="text-sm font-semibold text-muted-foreground">{dateLabel}</span>
    </div>
  )
}

function renderEventsGroup({ events, trackSlug, userId, activeEventId }: EventsGroupProps) {
  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isActive = activeEventId === event.id

        return renderTimelineRow({
          event,
          trackSlug,
          userId,
          isActive
        })
      })}
    </div>
  )
}

function renderTimelineRow({ event, trackSlug, userId, isActive }: TimelineRowProps) {
  return (
    <div key={event.id} className="relative">
      {renderTimelineNode(isActive)}
      <Link href={`/${userId}/tracks/${trackSlug}/${event.id}`} className="block">
        <TrackEventCard event={event} isActive={isActive} className="w-full" />
      </Link>
    </div>
  )
}

function renderTimelineConnector() {
  return (
    <span
      aria-hidden
      className="absolute top-0 bottom-0 left-4 w-px -translate-x-1/2 bg-border"
      data-testid="timeline-connector"
    />
  )
}

function renderTimelineNode(isActive: boolean) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute -left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full border-2 border-primary transition-all',
        isActive ? 'h-5 w-5 bg-primary' : 'h-5 w-5 bg-background'
      )}
      data-testid="timeline-node"
      data-active={isActive ? 'true' : 'false'}
    />
  )
}
