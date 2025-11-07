import type { EventDetailProps } from './types';
import { formatEventDate, formatTimestamp } from './helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function EventDetail({ event }: EventDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>{formatEventDate(event.date)}</CardDescription>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {event.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <p className="text-sm text-foreground">{event.description}</p>
          </div>
        )}
        {event.fileUrl && renderFileLink(event.fileUrl)}
        <div className="border-t pt-4">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span> {formatTimestamp(event.createdAt)}
            </div>
            {event.updatedAt !== event.createdAt && (
              <div>
                <span className="font-medium">Updated:</span> {formatTimestamp(event.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderFileLink(fileUrl: string) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Attachment</h3>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        View attached file →
      </a>
    </div>
  );
}
