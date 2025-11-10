import { fetchTrack, fetchTrackEvents } from '../helpers'
import { TrackEventList } from '@/components/track_event_list'
import { DateScroller } from '@/components/date_scroller'

type TrackListSlotProps = {
  params: Promise<{
    trackSlug: string
  }>
}

export default async function TrackListSlot({ params }: TrackListSlotProps) {
  const { trackSlug } = await params

  const [track, events] = await Promise.all([fetchTrack(trackSlug), fetchTrackEvents(trackSlug)])

  return (
    <>
      <h1 className="text-3xl font-bold">{track.name}</h1>
      <div className="mt-6">
        <DateScroller referenceDate={events[0]?.date} />
      </div>
      <div className="mt-8">
        <TrackEventList events={events} trackSlug={trackSlug} />
      </div>
    </>
  )
}

