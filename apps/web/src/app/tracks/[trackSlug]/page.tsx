import { fetchTrack, fetchTrackEvents } from './helpers'
import { TrackEventList } from '@/components/track_event_list'
import type { TrackPageProps } from './types'

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackSlug } = await params

  const [track, events] = await Promise.all([fetchTrack(trackSlug), fetchTrackEvents(trackSlug)])

  return (
    <>
      <h1 className="text-3xl font-bold">{track.name}</h1>
      <div className="mt-8">
        <TrackEventList events={events} trackSlug={trackSlug} />
      </div>
    </>
  )
}
