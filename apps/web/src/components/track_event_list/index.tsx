import type { TrackEventListProps } from './types'
import { formatEventDate } from './helpers'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function TrackEventList({ events }: TrackEventListProps) {
  if (events.length === 0) {
    return renderEmptyState()
  }

  return (
    <div className='space-y-4'>
      {events.map((event) => renderEventCard(event))}
    </div>
  )
}

function renderEmptyState() {
  return (
    <Card>
      <CardContent className='py-8 text-center text-muted-foreground'>
        No events recorded yet for this track.
      </CardContent>
    </Card>
  )
}

function renderEventCard(event: TrackEventListProps['events'][0]) {
  return (
    <Card key={event.id}>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-xl'>{event.title}</CardTitle>
            <CardDescription>{formatEventDate(event.date)}</CardDescription>
          </div>
          <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
            {event.type}
          </span>
        </div>
      </CardHeader>
      {(event.description || event.fileUrl) && (
        <CardContent className='space-y-3'>
          {event.description && (
            <p className='text-sm text-foreground'>{event.description}</p>
          )}
          {event.fileUrl && renderFileLink(event.fileUrl)}
        </CardContent>
      )}
    </Card>
  )
}

function renderFileLink(fileUrl: string) {
  return (
    <div className='mt-2'>
      <a
        href={fileUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='text-sm text-primary hover:underline'
      >
        View attached file →
      </a>
    </div>
  )
}
