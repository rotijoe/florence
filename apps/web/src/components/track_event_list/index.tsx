import Link from 'next/link';
import type { TrackEventListProps } from './types';
import { formatEventDate } from './helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TrackEventList({ events, trackSlug, activeEventId }: TrackEventListProps) {
  if (events.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-4">
      {events.map((event) => renderEventCard(event, trackSlug, activeEventId === event.id))}
    </div>
  );
}

function renderEmptyState() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        No events recorded yet for this track.
      </CardContent>
    </Card>
  );
}

function renderEventCard(
  event: TrackEventListProps['events'][0],
  trackSlug: string,
  isActive: boolean
) {
  const hasFileUrl = !!event.fileUrl;
  
  const cardContent = (
    <Card
      key={event.id}
      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
        isActive ? 'border-primary bg-accent' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription>{formatEventDate(event.date)}</CardDescription>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {event.type}
          </span>
        </div>
      </CardHeader>
      {(event.description || hasFileUrl) && (
        <CardContent className="space-y-3">
          {event.description && <p className="text-sm text-foreground">{event.description}</p>}
          {hasFileUrl && (
            <div className="mt-2">
              <a
                href={event.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(event.fileUrl!, '_blank', 'noopener,noreferrer');
                }}
              >
                View attached file →
              </a>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (hasFileUrl) {
    // If there's a file URL, wrap in a div instead of Link to avoid nested anchors
    return (
      <div key={event.id} className="block">
        <div
          className="cursor-pointer"
          onClick={() => {
            window.location.href = `/tracks/${trackSlug}/${event.id}`;
          }}
        >
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <Link key={event.id} href={`/tracks/${trackSlug}/${event.id}`} className="block">
      {cardContent}
    </Link>
  );
}

