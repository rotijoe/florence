'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { TrackEventList } from '@/components/track_event_list';
import { DateScroller } from '@/components/date_scroller';
import type { TrackLayoutClientProps } from './layout_types';

export function TrackLayoutClient({
  children,
  trackName: _trackName,
  events,
  trackSlug,
}: TrackLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Detect if we're on an event detail page
  const eventIdMatch = pathname?.match(/\/tracks\/[^/]+\/([^/]+)$/);
  const eventId =
    eventIdMatch !== null && eventIdMatch[1] !== undefined && eventIdMatch[1] !== trackSlug
      ? eventIdMatch[1]
      : null;
  const isEventPage = eventId !== null;

  // Check if mobile on mount and resize
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle dialog state based on event page
  useEffect(() => {
    if (isMobile) {
      setIsDialogOpen(isEventPage);
    }
  }, [isMobile, isEventPage]);

  function handleDialogOpenChange(open: boolean) {
    if (!open && isMobile && isEventPage) {
      router.push(`/tracks/${trackSlug}`);
    }
  }

  function renderEventsList() {
    return (
      <div>
        <div className="mt-6">
          <DateScroller referenceDate={events[0]?.date} />
        </div>
        <div className="mt-8">
          <TrackEventList events={events} trackSlug={trackSlug} activeEventId={eventId} />
        </div>
      </div>
    );
  }

  function getEventTitle() {
    if (!eventId) return 'Event Details';
    const event = events.find((e) => e.id === eventId);
    return event?.title ?? 'Event Details';
  }

  // Mobile: Show full-width events list, dialog for event detail
  if (isMobile) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">{renderEventsList()}</div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
            <VisuallyHidden>
              <DialogTitle>{getEventTitle()}</DialogTitle>
            </VisuallyHidden>
            {isEventPage && children}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop: Two-column layout
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:overflow-y-auto md:max-h-[calc(100vh-8rem)]">{renderEventsList()}</div>
        <div className="md:overflow-y-auto md:max-h-[calc(100vh-8rem)]">
          {isEventPage && children}
        </div>
      </div>
    </div>
  );
}
