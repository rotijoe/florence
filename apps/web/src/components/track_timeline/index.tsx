import { Card, CardContent } from '@/components/ui/card'
import type { EventResponse } from '@packages/types'
import type { TrackTimelineProps } from './types'
import { groupEventsByDate, formatDateLabel } from '@/components/track_event_list/helpers'
import { TrackEventTile } from '@/components/track_event_tile'

export function TrackTimeline({
  userId,
  trackSlug,
  pastEvents,
  activeEventId
}: TrackTimelineProps) {
  const hasAnyEvents = pastEvents.length > 0

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

  const pastGroups = groupEventsByDate(pastEvents)

  return (
    <div className='relative space-y-6'>
      {pastGroups.map((group) => {
        return (
          <div key={group.date}>
            {renderDateLabel(group.date)}
            <div className='space-y-3'>
              {group.events.map((event) => {
                return renderTimelineRow(event, userId, trackSlug, activeEventId)
              })}
            </div>
          </div>
        )
      })}
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

function renderTimelineRow(
  event: EventResponse,
  userId: string,
  trackSlug: string,
  activeEventId?: string | null
) {
  const isActive = activeEventId === event.id

  return (
    <div
      key={event.id}
      className='relative'
      data-testid={`timeline-event-${event.id}`}
      data-upcoming='false'
    >
      <TrackEventTile
        userId={userId}
        trackSlug={trackSlug}
        event={event}
        isActive={isActive}
        isUpcoming={false}
      />
    </div>
  )
}
