import type { TrackResponse, EventResponse } from '@packages/types'

export type TrackPageData = {
  track: TrackResponse
  events: EventResponse[]
}

export type TrackPageProps = {
  params: Promise<{
    trackSlug: string
  }>
}

export type TrackLayoutProps = {
  children: React.ReactNode
  tracklist: React.ReactNode // @tracklist slot
  event: React.ReactNode // @event slot
  params: Promise<{
    trackSlug: string
  }>
}
