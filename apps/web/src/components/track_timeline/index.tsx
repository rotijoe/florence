import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { EventResponse } from '@packages/types'
import type { TrackTimelineProps } from './types'
import { groupEventsByDate, formatDateLabel } from '@/components/track_event_list/helpers'
import { sortFutureAppointments } from '@/app/[userId]/tracks/[trackSlug]/helpers'
import { TrackEventTile } from '@/components/track_event_tile'

export function TrackTimeline({
  userId,
  trackSlug,
  futureAppointments,
  pastEvents,
  activeEventId
}: TrackTimelineProps) {
  const hasAnyEvents = futureAppointments.length > 0 || pastEvents.length > 0

  if (!hasAnyEvents) {
    return (
      <div className='relative'>
        {renderTimelineConnector()}
        <Card>
          <CardContent className='py-8 text-center text-muted-foreground'>
            No events recorded yet for this track.
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedFutureAppointments = sortFutureAppointments(futureAppointments)
  const pastGroups = groupEventsByDate(pastEvents)

  return (
    <div className='relative space-y-6 pl-10'>
      {renderTimelineConnector()}
      {sortedFutureAppointments.length > 0 &&
        renderUpcomingAppointments(sortedFutureAppointments, userId, trackSlug, activeEventId)}
      {sortedFutureAppointments.length > 0 && renderPastDivider()}
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

function renderTimelineConnector() {
  return (
    <span
      aria-hidden
      className='absolute top-0 bottom-0 left-4 w-px -translate-x-1/2 bg-border'
      data-testid='timeline-connector'
    />
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

function renderPastDivider() {
  return (
    <div className='py-2'>
      <div className='flex items-center gap-3'>
        <Separator className='flex-1' />
        <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Past events
        </span>
        <Separator className='flex-1' />
      </div>
    </div>
  )
}

function renderUpcomingAppointments(
  appointments: EventResponse[],
  userId: string,
  trackSlug: string,
  activeEventId?: string | null
) {
  return (
    <div className='space-y-3'>
      {appointments.map((event) => {
        return renderTimelineRow(event, userId, trackSlug, activeEventId, true)
      })}
    </div>
  )
}

function renderTimelineRow(
  event: EventResponse,
  userId: string,
  trackSlug: string,
  activeEventId?: string | null,
  isUpcoming = false
) {
  const isActive = activeEventId === event.id

  return (
    <div
      key={event.id}
      className='relative'
      data-testid={`timeline-event-${event.id}`}
      data-upcoming={isUpcoming ? 'true' : 'false'}
    >
      {renderTimelineNode(isActive)}
      <TrackEventTile
        userId={userId}
        trackSlug={trackSlug}
        event={event}
        isActive={isActive}
        isUpcoming={isUpcoming}
      />
    </div>
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
      data-testid='timeline-node'
      data-active={isActive ? 'true' : 'false'}
    />
  )
}


