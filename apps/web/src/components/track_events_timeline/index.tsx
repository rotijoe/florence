import { Card, CardContent } from '@/components/ui/card'
import { EventType, type EventResponse } from '@packages/types'
import type { TrackEventsTimelineProps } from './types'
import { groupEventsByDate, formatDateLabel } from '@/components/track_event_list/helpers'
import { TrackEventTile } from '@/components/track_event_tile'

export function TrackEventsTimeline({ userId, trackSlug, events }: TrackEventsTimelineProps) {
  const hasAnyEvents = events.length > 0

  if (!hasAnyEvents) {
    return (
      <div className='relative'>
        <Card>
          <CardContent className='py-8 text-center text-muted-foreground'>
            No events recorded yet for this track.
          </CardContent>
        </Card>
      </div>
    )
  }

  const eventGroups = groupEventsByDate(events)
  console.log('eventGroups', eventGroups)
  return (
    <div className='relative space-y-6'>
      {eventGroups.map((group) => renderDateGroup(group, userId, trackSlug))}
    </div>
  )
}

function renderDateGroup(
  group: { date: string; events: EventResponse[] },
  userId: string,
  trackSlug: string
) {
  const hasNonSymptomEvents = group.events.some((event) => event.type !== EventType.SYMPTOM)

  return (
    <div key={group.date}>
      {hasNonSymptomEvents && renderDateLabel(group.date)}
      <div className='space-y-3'>
        {group.events.map((event) => renderEvent(event, userId, trackSlug))}
      </div>
    </div>
  )
}

function renderDateLabel(date: string) {
  const dateLabel = formatDateLabel(date)

  return (
    <div className='mb-2 sticky top-0 bg-background h-8'>
      <span className='text-sm font-semibold text-muted-foreground'>{dateLabel}</span>
    </div>
  )
}

function renderEvent(event: EventResponse, userId: string, trackSlug: string) {
  return (
    <div key={event.id} className='relative' data-testid={`timeline-event-${event.id}`}>
      <TrackEventTile userId={userId} trackSlug={trackSlug} event={event} isUpcoming={false} />
    </div>
  )
}
