import { fetchTrack, fetchTrackEvents } from './helpers'
import { TrackEventList } from '@/components/track_event_list'
import { TrackHeader } from '@/components/track_header'
import type { TrackPageProps } from './types'

export default async function TrackPage({ params }: TrackPageProps) {
  const { userId, trackSlug } = await params

  const [track, events] = await Promise.all([
    fetchTrack(userId, trackSlug),
    fetchTrackEvents(userId, trackSlug)
  ])

  return (
    <>
      <TrackHeader track={track} userId={userId} trackSlug={trackSlug} />
      <div className='mt-8'>
        <TrackEventList events={events} trackSlug={trackSlug} userId={userId} />
      </div>
    </>
  )
}
