import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatEventTime } from '../track_event_list/helpers'
import type { TrackEventCardProps } from './types'

export function TrackEventCard({ event, isActive, className }: TrackEventCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50',
        isActive && 'border-primary bg-accent',
        className
      )}
      data-testid='track-event-card'
      data-active={isActive ? 'true' : 'false'}
    >
      <CardHeader className='pb-1'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <CardTitle className='text-lg font-semibold'>{event.title}</CardTitle>
          </div>
          <div className='flex flex-col items-end gap-2 text-right'>
            <span className='text-sm font-semibold text-muted-foreground'>
              {formatEventTime(event.date)}
            </span>
            <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
              {event.type}
            </span>
          </div>
        </div>
      </CardHeader>
      {event.notes && (
        <CardContent className='space-y-3'>
          <p className='text-sm text-foreground'>{event.notes}</p>
        </CardContent>
      )}
    </Card>
  )
}
