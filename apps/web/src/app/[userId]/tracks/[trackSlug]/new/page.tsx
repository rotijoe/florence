import { EventDetail } from '@/components/event_detail'
import type { NewEventPageProps } from './types'
import { EventType } from '@packages/types'

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { userId, trackSlug } = await params

  // Create a placeholder event object for create mode
  const placeholderEvent = {
    id: 'new',
    trackId: '',
    date: new Date().toISOString(),
    type: EventType.NOTE,
    title: '',
    notes: null,
    fileUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return (
    <EventDetail event={placeholderEvent} trackSlug={trackSlug} userId={userId} mode='create' />
  )
}
