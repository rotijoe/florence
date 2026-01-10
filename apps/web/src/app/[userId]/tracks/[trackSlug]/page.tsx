import {
  fetchTrack,
  fetchTrackEvents,
  splitEventsByTime,
  filterNotificationsForTrack,
  mapEventResponseToUpcomingEvent
} from './helpers'
import { TrackHeader } from '@/components/track_header'
import { TrackEventsTimeline } from '@/components/track_events_timeline'
import { RemindersPanel } from '@/components/reminders_panel'
import { UpcomingEventsPanel } from '@/components/upcoming_events_panel'
import { AddEventButton } from '@/components/add_event_button'
import type { TrackPageProps } from './types'
import { fetchHubNotifications } from '@/lib/fetch_hub_notifications'
import { fetchTracksWithCookies } from '@/lib/fetch_tracks'
import { mapTracksToHealthTrackSummary } from '@/app/[userId]/helpers'
import { buildTrackOptions } from '@/components/hub_quick_actions/helpers'

export default async function TrackPage({ params }: TrackPageProps) {
  const { userId, trackSlug } = await params

  const [track, events, hubNotifications, tracksData] = await Promise.all([
    fetchTrack(userId, trackSlug),
    fetchTrackEvents(userId, trackSlug),
    fetchHubNotifications(userId),
    fetchTracksWithCookies(userId)
  ])

  const { futureEvents, pastEvents } = splitEventsByTime(events, new Date())
  const trackNotifications = filterNotificationsForTrack(hubNotifications, userId, trackSlug)
  const tracks = mapTracksToHealthTrackSummary(tracksData)
  const trackOptions = buildTrackOptions(tracks)
  const upcomingEvents = futureEvents.map((event) =>
    mapEventResponseToUpcomingEvent(event, userId, trackSlug)
  )
  const returnTo = encodeURIComponent(`/${userId}/tracks/${trackSlug}`)
  const addEventHref = `/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}`

  return (
    <div className='bg-background'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <section>
          <TrackHeader track={track} userId={userId} trackSlug={trackSlug} />
        </section>

        <section className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]'>
          <div className='order-2 space-y-6 md:order-1'>
            {/* <TrackQuickAddBar userId={userId} trackSlug={trackSlug} /> */}

            <TrackEventsTimeline userId={userId} trackSlug={trackSlug} events={pastEvents} />
          </div>

          <div className='order-1 space-y-4 md:order-2'>
            {upcomingEvents.length > 0 && (
              <UpcomingEventsPanel title='Upcoming' upcomingEvents={upcomingEvents} />
            )}
            <AddEventButton userId={userId} trackSlug={trackSlug} />
            <RemindersPanel
              notifications={trackNotifications}
              tracks={trackOptions}
              userId={userId}
              addEventHref={addEventHref}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
