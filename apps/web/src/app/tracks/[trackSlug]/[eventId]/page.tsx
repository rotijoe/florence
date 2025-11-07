import { fetchEvent } from '../helpers';
import { EventDetail } from '@/components/event_detail';
import type { EventPageProps } from './types';

export default async function EventPage({ params }: EventPageProps) {
  const { trackSlug, eventId } = await params;

  const event = await fetchEvent(eventId, trackSlug);

  return <EventDetail event={event} />;
}
