import {
  fetchTrack,
  fetchTrackEvents,
  splitEventsByTime,
  filterNotificationsForTrack
} from './helpers'
import { TrackHeader } from '@/components/track_header'
import { TrackQuickAddBar } from '@/components/track_quick_add_bar'
import { TrackTimeline } from '@/components/track_timeline'
import { TrackRemindersPanel } from '@/components/track_reminders_panel'
import type { TrackPageProps } from './types'
import { fetchHubNotifications } from '@/app/[userId]/helpers'

export default async function TrackPage({ params }: TrackPageProps) {
  const { userId, trackSlug } = await params

  const [track, events, hubNotifications] = await Promise.all([
    fetchTrack(userId, trackSlug),
    fetchTrackEvents(userId, trackSlug),
    fetchHubNotifications()
  ])

  const { futureAppointments, pastEvents } = splitEventsByTime(events, new Date())
  const trackNotifications = filterNotificationsForTrack(hubNotifications, userId, trackSlug)

  return (
    <>
      <TrackHeader track={track} userId={userId} trackSlug={trackSlug} />
      <div className='mt-8'>
        <div className='space-y-6'>
          <TrackQuickAddBar userId={userId} trackSlug={trackSlug} />
          <TrackRemindersPanel notifications={trackNotifications} />
          <TrackTimeline
            userId={userId}
            trackSlug={trackSlug}
            futureAppointments={futureAppointments}
            pastEvents={pastEvents}
          />
        </div>
      </div>
    </>
  )
}
