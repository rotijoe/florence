import type { EventResponse } from '@packages/types'

export type EventDetailProps = {
  event: EventResponse
  trackSlug: string
  userId: string
  mode: 'create' | 'edit'
}
