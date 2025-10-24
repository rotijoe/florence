import { fetchTrack, fetchTrackEvents } from './helpers'
import { TrackEventList } from '@/components/track_event_list'
import { TrackPageProps } from './types'

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackSlug } = await params

  const [track, events] = await Promise.all([
    fetchTrack(trackSlug),
    fetchTrackEvents(trackSlug)
  ])

  return (
    <div className='container mx-auto px-4 py-8'>
      {renderHeader(track.name)}
      <div className='mt-8'>
        <TrackEventList events={events} />
      </div>
    </div>
  )
}

function renderHeader(trackName: string) {
  return (
    <div className='mb-8'>
      <h1 className='text-4xl font-bold tracking-tight'>{trackName}</h1>
      <p className='mt-2 text-muted-foreground'>
        View all events for this health track
      </p>
    </div>
  )
}
