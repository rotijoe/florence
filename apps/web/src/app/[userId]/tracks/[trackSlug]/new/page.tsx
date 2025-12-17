import { EventDetail } from '@/components/event_detail'
import type { NewEventPageProps } from './types'
import { EventType } from '@packages/types'

function isValidEventType(value: string | undefined): value is EventType {
  if (!value) return false
  return Object.values(EventType).includes(value as EventType)
}

export default async function NewEventPage({ params, searchParams }: NewEventPageProps) {
  const { userId, trackSlug } = await params
  const requestedType = searchParams?.type
  const initialType = isValidEventType(requestedType) ? requestedType : EventType.NOTE

  // Create a placeholder event object for create mode
  const placeholderEvent = {
    id: 'new',
    trackId: '',
    date: new Date().toISOString(),
    type: initialType,
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
