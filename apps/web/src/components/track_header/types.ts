import type { TrackResponse } from '@packages/types'

export type TrackHeaderProps = {
  track: TrackResponse
  userId: string
  trackSlug: string
  onCreateEvent: () => void
}

export type TrackHeaderClientProps = {
  track: TrackResponse
  userId: string
  trackSlug: string
  createEventAction: (formData: FormData) => Promise<void>
}
