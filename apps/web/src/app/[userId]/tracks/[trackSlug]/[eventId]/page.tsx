import { EventDetail } from '@/components/event_detail'
import type { EventPageProps } from './types'
import { fetchEvent } from '@/lib/fetch_event'

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { userId, trackSlug, eventId } = await params
  const search = await searchParams
  const isNew = search?.new === '1'

  const event = await fetchEvent(eventId, userId, trackSlug)

  return <EventDetail event={event} trackSlug={trackSlug} userId={userId} isNew={isNew} />
}
