import { HubFooter } from '@/components/hub_footer'
import { HubHealthTracks } from '@/components/hub_health_tracks'
import { RemindersPanel } from '@/components/reminders_panel'
import { HubQuickActions } from '@/components/hub_quick_actions'
import { buildTrackOptions } from '@/components/hub_quick_actions/helpers'
import { HubRecentActivity } from '@/components/hub_recent_activity'
import { UpcomingEventsPanel } from '@/components/upcoming_events_panel'
import { HubWelcomeHeader } from '@/components/hub_welcome_header'
import {
  getGreetingForUser,
  mapTracksToHealthTrackSummary,
  fetchUpcomingAppointmentsForHub
} from './helpers'
import { fetchUserProfileWithCookies } from '@/lib/fetch_user_profile'
import { fetchTracksWithCookies } from '@/lib/fetch_tracks'
import { fetchHubNotifications } from '@/lib/fetch_hub_notifications'
import { WELCOME_SUBTITLE } from './constants'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

export default async function Hub({ params }: UserHomePageProps) {
  const { userId } = await params

  // Layout already validates userId matches session, so we can trust it here
  const [userProfile, tracksData] = await Promise.all([
    fetchUserProfileWithCookies(userId),
    fetchTracksWithCookies(userId)
  ])

  const greeting = getGreetingForUser(userProfile.name)
  const tracks = mapTracksToHealthTrackSummary(tracksData)
  const upcomingEvents = await fetchUpcomingAppointmentsForHub(userId)
  const notifications = await fetchHubNotifications(userId)
  const quickActionTrackOptions = buildTrackOptions(tracks)

  return (
    <div className='bg-background'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <section className='space-y-4'>
          <HubWelcomeHeader greeting={greeting} subtitle={WELCOME_SUBTITLE} />
          <HubQuickActions tracks={quickActionTrackOptions} userId={userId} />
        </section>

        <section className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]'>
          <div className='space-y-4'>
            <HubHealthTracks userId={userId} tracks={tracks} />
            <UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={upcomingEvents} />
          </div>

          <div className='space-y-4'>
            <RemindersPanel
              notifications={notifications}
              tracks={quickActionTrackOptions}
              userId={userId}
              title='Notifications'
            />
            <HubRecentActivity items={[]} />
          </div>
        </section>

        <section>
          <HubFooter />
        </section>
      </div>
    </div>
  )
}
