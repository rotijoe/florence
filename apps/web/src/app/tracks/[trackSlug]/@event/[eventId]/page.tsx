import { fetchEvent } from '@/lib/fetch_event'
import { EventDetail } from '@/components/event_detail'

type EventSlotPageProps = {
  params: Promise<{
    trackSlug: string
    eventId: string
  }>
}

export default async function EventSlotPage({ params }: EventSlotPageProps) {
  const { trackSlug, eventId } = await params

  const event = await fetchEvent(eventId, trackSlug)

  return (
    <div className="hidden md:block">
      <EventDetail event={event} />
    </div>
  )
}
