import {
  fetchTrack,
  fetchTrackEvents,
  splitEventsByTime,
  filterNotificationsForTrack,
  mapEventResponseToUpcomingEvent
} from './helpers'
import { TrackHeader } from '@/components/track_header'
import { TrackTimeline } from '@/components/track_timeline'
import { RemindersPanel } from '@/components/reminders_panel'
import { UpcomingEventsPanel } from '@/components/upcoming_events_panel'
import type { TrackPageProps } from './types'
import {
  fetchHubNotifications,
  fetchUserMeWithCookies,
  mapTracksToHealthTrackSummary
} from '@/app/[userId]/helpers'
import { buildTrackOptions } from '@/components/hub_quick_actions/helpers'

export default async function TrackPage({ params }: TrackPageProps) {
  const { userId, trackSlug } = await params

  const [track, events, hubNotifications, userData] = await Promise.all([
    fetchTrack(userId, trackSlug),
    fetchTrackEvents(userId, trackSlug),
    fetchHubNotifications(userId),
    fetchUserMeWithCookies(userId)
  ])

  const { futureAppointments, pastEvents } = splitEventsByTime(events, new Date())
  const trackNotifications = filterNotificationsForTrack(hubNotifications, userId, trackSlug)
  const tracks = mapTracksToHealthTrackSummary(userData.tracks)
  const trackOptions = buildTrackOptions(tracks)
  const upcomingEvents = futureAppointments.map((event) =>
    mapEventResponseToUpcomingEvent(event, userId, trackSlug)
  )

  return (
    <div className='bg-background'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <section>
          <TrackHeader track={track} userId={userId} trackSlug={trackSlug} />
        </section>

        <section className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]'>
          <div className='space-y-6'>
            {/* <TrackQuickAddBar userId={userId} trackSlug={trackSlug} /> */}

            <TrackTimeline userId={userId} trackSlug={trackSlug} pastEvents={pastEvents} />
          </div>

          <div className='space-y-4'>
            {upcomingEvents.length > 0 && (
              <UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={upcomingEvents} />
            )}
            <RemindersPanel
              notifications={trackNotifications}
              tracks={trackOptions}
              userId={userId}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
