import { fetchTrack, fetchTrackEvents } from './helpers'
import { TrackEventList } from '@/components/track_event_list'
import type { TrackPageProps } from './types'
import { createEventAction } from './actions'
import { Button } from '@/components/ui/button'

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{track.name}</h1>
        <form action={handleCreateEvent}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="trackSlug" value={trackSlug} />
          <Button type="submit">Create event</Button>
        </form>
      </div>
      <div className="mt-8">
        <TrackEventList events={events} trackSlug={trackSlug} userId={userId} />
      </div>
    </>
  )
}
