import type { TrackResponse, EventResponse } from '@packages/types'

export type TrackPageData = {
  track: TrackResponse
  events: EventResponse[]
}

export type TrackPageProps = {
  params: Promise<{
    userId: string
    trackSlug: string
  }>
}

export type TrackLayoutProps = {
  children: React.ReactNode
  params: Promise<{
    userId: string
    trackSlug: string
  }>
}
