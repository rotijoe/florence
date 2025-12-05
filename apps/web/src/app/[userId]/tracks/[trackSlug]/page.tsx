import { fetchTrack, fetchTrackEvents } from './helpers'
import { TrackEventList } from '@/components/track_event_list'
import { TrackHeaderClient } from '@/components/track_header/track_header_client'
import type { TrackPageProps } from './types'
import { createEventAction } from './actions'

export default async function TrackPage({ params }: TrackPageProps) {
  const { userId, trackSlug } = await params

  const [track, events] = await Promise.all([
    fetchTrack(userId, trackSlug),
    fetchTrackEvents(userId, trackSlug)
  ])

  async function handleCreateEvent(formData: FormData) {
    'use server'
    await createEventAction(formData)
  }

  return (
    <>
      <TrackHeaderClient
        track={track}
        userId={userId}
        trackSlug={trackSlug}
        createEventAction={handleCreateEvent}
      />
      <div className='mt-8'>
        <TrackEventList events={events} trackSlug={trackSlug} userId={userId} />
      </div>
    </>
  )
}
