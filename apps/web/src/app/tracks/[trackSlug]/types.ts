import type { TrackResponse, EventResponse } from '@packages/types'

export type TrackPageData = {
  track: TrackResponse
  events: EventResponse[]
}

export type TrackPageProps = {
  params: {
    trackSlug: string
  }
}
