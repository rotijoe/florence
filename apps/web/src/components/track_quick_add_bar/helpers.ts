import { type EventType } from '@packages/types'

export function buildAddEventHref({
  userId,
  trackSlug,
  type
}: {
  userId: string
  trackSlug: string
  type: EventType
}): string {
  const returnTo = encodeURIComponent(`/${userId}/tracks/${trackSlug}`)
  return `/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}&type=${type}`
}



