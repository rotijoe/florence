import { EventDetail } from '@/components/event_detail'
import type { EventPageProps } from './types'
import { fetchEvent } from '@/lib/fetch_event'

export default async function EventPage({ params }: EventPageProps) {
  const { userId, trackSlug, eventId } = await params

  const event = await fetchEvent(eventId, userId, trackSlug)

  return <EventDetail event={event} trackSlug={trackSlug} userId={userId} mode='edit' />
}
