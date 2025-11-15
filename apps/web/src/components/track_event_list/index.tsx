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

export function TrackEventList({ events, trackSlug, activeEventId }: TrackEventListProps) {
  if (events.length === 0) {
    return renderEmptyState()
  }

  const dateGroups = groupEventsByDate(events)

  return (
    <div className="relative grid grid-cols-[auto_1fr] gap-10">
      {renderTimelineConnector()}
      {dateGroups.map((group, groupIndex) =>
        renderDateGroup({
          group,
          groupIndex,
          totalGroups: dateGroups.length,
          trackSlug,
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

function renderDateGroup({ group, groupIndex, trackSlug, activeEventId }: DateGroupProps) {
  return (
    <div key={groupIndex}>
      {renderDateLabel(group.date)}
      {renderEventsGroup({
        events: group.events,
        trackSlug,
        activeEventId
      })}
    </div>
  )
}

function renderDateLabel(date: string) {
  const dateLabel = formatDateLabel(date)

  return (
    <div className="mb-2 col-start-2 sticky top-0 bg-background h-8 pl-1">
      <span className="text-sm font-semibold text-muted-foreground">{dateLabel}</span>
    </div>
  )
}

function renderEventsGroup({ events, trackSlug, activeEventId }: EventsGroupProps) {
  return (
    <>
      {events.map((event) => {
        const isActive = activeEventId === event.id

        return renderTimelineRow({
          event,
          trackSlug,
          isActive
        })
      })}
    </>
  )
}

function renderTimelineRow({ event, trackSlug, isActive }: TimelineRowProps) {
  return (
    <>
      {renderTimelineNode(isActive)}
      <Link
        href={`/tracks/${trackSlug}/${event.id}`}
        className="block col-start-2 justify-self-stretch pl-1"
      >
        <TrackEventCard event={event} isActive={isActive} className="w-full" />
      </Link>
    </>
  )
}

function renderTimelineConnector() {
  return (
    <span
      aria-hidden
      className="absolute top-20 bottom-0 left-[10px] w-px bg-border"
      data-testid="timeline-connector"
    />
  )
}

function renderTimelineNode(isActive: boolean) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative z-10 rounded-full border-2 border-primary transition-all col-start-1',
        isActive ? 'h-5 w-5 bg-primary' : 'h-5 w-5 bg-background'
      )}
      data-testid="timeline-node"
      data-active={isActive ? 'true' : 'false'}
    />
  )
}
