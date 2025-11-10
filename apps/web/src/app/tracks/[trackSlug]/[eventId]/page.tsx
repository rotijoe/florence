import { EventDetail } from '@/components/event_detail'
import type { EventPageProps } from './types'
import { fetchEvent } from '@/lib/fetch_event'

export default async function EventPage({ params }: EventPageProps) {
  const { trackSlug, eventId } = await params

  const event = await fetchEvent(eventId, trackSlug)

  return (
    <div className="block md:hidden container mx-auto px-4 py-8">
      <EventDetail event={event} />
    </div>
  )
}
